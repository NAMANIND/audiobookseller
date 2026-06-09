export type PurchaseStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type EmailType =
    | "PURCHASE_CONFIRMATION"
    | "DOWNLOAD_LINK"
    | "REFUND_CONFIRMATION";
export type EmailStatus = "PENDING" | "SENT" | "FAILED";

export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    coverImage: string;
    storagePath: string;
    fallbackUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Purchase {
    id: string;
    bookId: string;
    email: string;
    orderId: string;
    paymentId?: string;
    amount: number;
    currency: string;
    status: PurchaseStatus;
    downloadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface EmailRecord {
    id: string;
    purchaseId: string;
    type: EmailType;
    status: EmailStatus;
    sentAt?: string;
    createdAt: string;
}