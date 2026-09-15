import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  handleGenerateDraft,
  handleRefineDraft,
  handleFinalizeSteps,
} from "./src/server/advisor-gemini.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes FIRST
// 1. Generate initial draft
app.post("/api/generate-draft", async (req: Request, res: Response) => {
  try {
    const result = await handleGenerateDraft(req.body);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// 2. Refine draft based on user feedback
app.post("/api/refine-draft", async (req: Request, res: Response) => {
  try {
    const result = await handleRefineDraft(req.body);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// 3. Finalize and provide prioritized next steps
app.post("/api/finalize-steps", async (req: Request, res: Response) => {
  try {
    const result = await handleFinalizeSteps(req.body);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// API health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Setup Vite development middleware or static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Letter Writing Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
