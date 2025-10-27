import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create initial books
  const books = [
    // {
    //   id: "cmbhtanwy0000hquxkgsuvmn5",
    //   title: "The Great Gatsby",
    //   author: "F. Scott Fitzgerald",
    //   description:
    //     "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    //   price: 1.0,
    //   coverImage:
    //     "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    // },
    // {
    //   id: "cmbhtanwy0001hquxlzqt8m4n",
    //   title: "1984",
    //   author: "George Orwell",
    //   description:
    //     "A dystopian social science fiction novel and cautionary tale.",
    //   price: 12.99,
    //   coverImage:
    //     "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    // },
    {
      id: "cmbhtanwy0001hquxlzqt8m4n",
      title:"the art of war",
      author: "test",
      description:
          "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
        price: 1.0,
        coverImage:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
      driveLink:"https://drive.google.com/file/d/1oArN5Fv-ba463PkvAatZTIVYNCYC90OZ/view?usp=drive_link"
    },
    {
      id: "cmbhtanwy0001hquxjbdjwlzqt8m4n",
      title:"the art of war 2",
      author: "test",
      description:
          "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
        price: 1.0,
        coverImage:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
      driveLink:"https://drive.google.com/file/d/1ZFr0AkVZxIjvZMnm3sN34ObrH1M-qptE/view?usp=drive_link"
    },

  ];

  // Clear existing books first
  await prisma.book.deleteMany();

  // Create all books
  await prisma.book.createMany({
    data: books,
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
