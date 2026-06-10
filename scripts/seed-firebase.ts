import { db } from "../src/lib/firebase-admin";
import { splashImage } from "../src/content/site";

async function main() {
    const books = [
        {
            id: "ehsaas",
            title: "Ehsaas: The Poetry of Bhawna Jaiswal",
            author: "Bhawna Jaiswal",
            description:
                "A soulful collection of Hindi poetry exploring emotion, memory, and connection — narrated in the poet's own voice.",
            price: 999,
            coverImage: splashImage(600, 600, "books"),
            storagePath: "audiobooks/ehsaas.mp3",
            fallbackUrl: "",
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
