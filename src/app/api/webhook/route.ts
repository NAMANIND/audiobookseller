import { NextRequest, NextResponse } from "next/server";
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

function validateAccessToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  const expectedToken = process.env.WEBHOOK_ACCESS_TOKEN;

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

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Webhook endpoint is active. Use POST to send articles." },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  if (!validateAccessToken(request)) {
    return NextResponse.json(
      { error: "Invalid access token" },
      { status: 401 }
    );
  }

  try {
    const payload = await request.json();

    if (!validatePayload(payload)) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    await processPublishArticlesEvent(payload);

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
