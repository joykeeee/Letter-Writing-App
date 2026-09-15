export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return res.status(200).json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    platform: "vercel-serverless",
  });
}
