import { db } from "../src/lib/firebase-admin";

async function main() {
    const books = [
        {
            id: "cmbhtanwy0001hquxlzqt8m4n",
            title: "the art of war",
            author: "test",
            description: "Classic strategy text.",
            price: 1.0,
            coverImage:
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
            storagePath: "audiobooks/the-art-of-war.mp3",
            fallbackUrl:
                "https://drive.google.com/file/d/1oArN5Fv-ba463PkvAatZTIVYNCYC90OZ/view?usp=drive_link",
        },
        {
            id: "cmbhtanwy0001hquxjbdjwlzqt8m4n",
            title: "the art of war 2",
            author: "test",
            description: "Sequel strategy text.",
            price: 1.0,
            coverImage:
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
            storagePath: "audiobooks/the-art-of-war-2.mp3",
            fallbackUrl:
                "https://drive.google.com/file/d/1ZFr0AkVZxIjvZMnm3sN34ObrH1M-qptE/view?usp=drive_link",
        },
    ];

    const now = new Date().toISOString();

    for (const book of books) {
        const { id, ...data } = book;
        await db.collection("books").doc(id).set({
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        console.log(`Seeded book: ${book.title}`);
    }

    console.log("Done.");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});