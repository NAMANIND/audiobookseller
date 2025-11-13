This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





## Google drive

Create a Service Account (Step-by-Step)

Go to Google Cloud Console
Select your project: drive-api-476418
In the left sidebar, go to IAM & Admin → Service Accounts
Click + CREATE SERVICE ACCOUNT at the top
Fill in the details:

Service account name: audiobook-drive-manager
Service account ID: (auto-filled, something like audiobook-drive-manager@drive-api-476418.iam.gserviceaccount.com)
Click CREATE AND CONTINUE


Grant this service account access to project (Optional, you can skip):

Click CONTINUE (skip this step)


Grant users access to this service account (Optional):

Click DONE (skip this step)


Now you'll see your service account in the list
Click on the service account email
Go to the KEYS tab
Click ADD KEY → Create new key
Select JSON format
Click CREATE
A JSON file will be downloaded - this is your service account key!




Go to Google Cloud Console

Select or create a project

Enable the Google Drive API (APIs & Services → Library → Search “Drive API” → Enable)
