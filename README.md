🛍️ Deal Drop — Smart Price Tracking & Price-Drop Alerts
Deal Drop is a price-tracking web application built using Next.js, Supabase, and Firecrawl that allows users to add products, automatically tracks price changes, and sends email alerts whenever a price drops or updates. The app also provides an interactive price-history graph to help users analyze trends and make informed purchase decisions.



🚀 Features
✔ Add products to a personal watchlist
✔ Automated web scraping using Firecrawl
✔ Background price monitoring with cron jobs
✔ Real-time email notifications on price change
✔ Historical price-trend graph & insights
✔ Supabase database + storage
✔ Secure API routes & validation
🛠️ Tech Stack
Frontend: Next.js (App Router), React
Backend: Supabase
Scraping Engine: Firecrawl
Email Service: SMTP / Supabase functions
Other: Cron Jobs, Webhooks, Node.js



Architecture Overview:
User → Add Product → Store in Supabase
           ↓
     Cron Job Scheduler
           ↓
   Firecrawl Scraper fetches price
           ↓
  Price change detected? → Yes
           ↓
   Save to price_history + Send Email
           ↓
   Show price graph in dashboard

   

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
