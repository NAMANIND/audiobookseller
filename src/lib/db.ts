import { db } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/users";
import type { Book, Purchase, EmailRecord, PurchaseStatus } from "@/lib/types";

const booksCol = () => db.collection("books");
const purchasesCol = () => db.collection("purchases");
const emailsCol = () => db.collection("emails");

export async function getBooks(): Promise<Book[]> {
    const snap = await booksCol().orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
}

export async function getBookById(id: string): Promise<Book | null> {
    const doc = await booksCol().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Book;
}

export async function createPurchase(data: {
    bookId: string;
    email: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: PurchaseStatus;
}): Promise<Purchase> {
    const now = new Date().toISOString();
    const ref = purchasesCol().doc();
    const purchase: Omit<Purchase, "id"> = {
        ...data,
        email: normalizeEmail(data.email),
        status: data.status ?? "PENDING",
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
    };
    await ref.set(purchase);
    return { id: ref.id, ...purchase };
}

export async function updatePurchaseByOrderId(
    orderId: string,
    data: Partial<Purchase>
): Promise<Purchase & { book: Book }> {
    const snap = await purchasesCol().where("orderId", "==", orderId).limit(1).get();
    if (snap.empty) throw new Error("Purchase not found");

    const doc = snap.docs[0];
    const now = new Date().toISOString();
    await doc.ref.update({ ...data, updatedAt: now });

    const purchase = { id: doc.id, ...doc.data(), ...data, updatedAt: now } as Purchase;
    const book = await getBookById(purchase.bookId);
    if (!book) throw new Error("Book not found");

    return { ...purchase, book };
}

export async function getPurchaseByIdAndEmail(
    purchaseId: string,
    email: string
): Promise<(Purchase & { book: Book }) | null> {
    const doc = await purchasesCol().doc(purchaseId).get();
    if (!doc.exists) return null;

    const purchase = { id: doc.id, ...doc.data() } as Purchase;
    if (purchase.email !== normalizeEmail(email) || purchase.status !== "COMPLETED") return null;

    const book = await getBookById(purchase.bookId);
    if (!book) return null;

    return { ...purchase, book };
}

export async function incrementDownloadCount(purchaseId: string): Promise<number> {
    const ref = purchasesCol().doc(purchaseId);
    const result = await db.runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        if (!doc.exists) throw new Error("Purchase not found");

        const current = doc.data()?.downloadCount ?? 0;
        const next = current + 1;
        tx.update(ref, { downloadCount: next, updatedAt: new Date().toISOString() });
        return next;
    });

    return result;
}

export async function getCompletedPurchasesByEmail(email: string) {
    const normalized = normalizeEmail(email);
    const snap = await purchasesCol()
        .where("email", "==", normalized)
        .where("status", "==", "COMPLETED")
        .orderBy("createdAt", "desc")
        .get();

    const results = [];
    for (const doc of snap.docs) {
        const purchase = { id: doc.id, ...doc.data() } as Purchase;
        const book = await getBookById(purchase.bookId);
        if (book) results.push({ purchase, book });
    }
    return results;
}

export async function createEmailRecord(data: {
    purchaseId: string;
    type: EmailRecord["type"];
    status?: EmailRecord["status"];
}): Promise<EmailRecord> {
    const now = new Date().toISOString();
    const ref = emailsCol().doc();
    const record: Omit<EmailRecord, "id"> = {
        purchaseId: data.purchaseId,
        type: data.type,
        status: data.status ?? "PENDING",
        createdAt: now,
    };
    await ref.set(record);
    return { id: ref.id, ...record };
}

export async function updateEmailRecord(
    id: string,
    data: Partial<EmailRecord>
): Promise<void> {
    await emailsCol().doc(id).update(data);
}