import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface Article {
  id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  created_at: string;
  image_url: string;
  slug: string;
  tags: string[];
}

interface PublishArticlesEvent {
  event_type: "publish_articles";
  timestamp: string;
  data: {
    articles: Article[];
  };
}

type WebhookPayload = PublishArticlesEvent;

function validateAccessToken(req: NextApiRequest): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  const expectedToken = process.env.WEBHOOK_ACCESS_TOKEN || "test";

  if (!expectedToken) {
    console.error("WEBHOOK_ACCESS_TOKEN is not configured");
    return false;
  }

  return token === expectedToken;
}

function validatePayload(payload: unknown): payload is WebhookPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const p = payload as Record<string, unknown>;

  if (p.event_type !== "publish_articles") {
    return false;
  }

  if (typeof p.timestamp !== "string") {
    return false;
  }

  if (!p.data || typeof p.data !== "object") {
    return false;
  }

  const data = p.data as Record<string, unknown>;
  if (!Array.isArray(data.articles)) {
    return false;
  }

  const requiredArticleFields = [
    "id",
    "title",
    "content_markdown",
    "content_html",
    "meta_description",
    "created_at",
    "image_url",
    "slug",
    "tags",
  ];

  return data.articles.every((article) => {
    if (!article || typeof article !== "object") {
      return false;
    }
    const a = article as Record<string, unknown>;
    return (
      requiredArticleFields.every((field) => field in a) &&
      typeof a.id === "string" &&
      typeof a.title === "string" &&
      typeof a.content_markdown === "string" &&
      typeof a.content_html === "string" &&
      typeof a.meta_description === "string" &&
      typeof a.created_at === "string" &&
      typeof a.image_url === "string" &&
      typeof a.slug === "string" &&
      Array.isArray(a.tags) &&
      a.tags.every((tag) => typeof tag === "string")
    );
  });
}

async function saveArticles(articles: Article[]): Promise<void> {
  const articlesPath = path.join(process.cwd(), "public", "articles.json");
  let existingArticles: Article[] = [];

  try {
    if (fs.existsSync(articlesPath)) {
      const fileContent = fs.readFileSync(articlesPath, "utf-8");
      existingArticles = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading existing articles:", error);
  }

  const articleMap = new Map<string, Article>();
  existingArticles.forEach((article) => {
    articleMap.set(article.id, article);
  });

  articles.forEach((article) => {
    articleMap.set(article.id, article);
  });

  const updatedArticles = Array.from(articleMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  fs.writeFileSync(articlesPath, JSON.stringify(updatedArticles, null, 2));
  console.log(`Saved ${articles.length} article(s) to articles.json`);
}

async function processPublishArticlesEvent(
  payload: PublishArticlesEvent
): Promise<void> {
  console.log(
    `Processing publish_articles event with ${payload.data.articles.length} article(s)`
  );

  for (const article of payload.data.articles) {
    console.log(`Processing article: ${article.id} - ${article.title}`);
  }

  await saveArticles(payload.data.articles);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!validateAccessToken(req)) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  try {
    const payload = req.body;

    if (!validatePayload(payload)) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    await processPublishArticlesEvent(payload);

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
