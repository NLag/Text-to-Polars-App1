import express from "express";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Start the Python FastAPI backend in the background so the UI can test it
  const pyProcess = spawn("npx", ["-y", "no-op"], { // Placeholder, we can't reliably install pip packages via JS runtime without pip being allowed.
    cwd: process.cwd(),
    env: { ...process.env },
  });
  // Actually, we'll spawn pip install first, then uvicorn via python3
  const uvicornProcess = spawn("python3", ["-m", "uvicorn", "main:app", "--port", "8000"], {
    cwd: process.cwd(),
    env: { ...process.env },
  });

  uvicornProcess.stdout.on("data", (data) => console.log(`[Python] ${data}`));
  uvicornProcess.stderr.on("data", (data) => console.error(`[Python] ${data}`));

  app.post("/api/generate", async (req, res) => {
    const { prompt, schema } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const fetchMod = await import('node-fetch'); // or use top-level fetch
      const result = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: prompt, 
          tables: schema ? JSON.parse(schema) : {} 
        })
      });

      if (!result.ok) {
         let errText = await result.text();
         throw new Error(`Python API Error: ${errText}`);
      }

      const data = await result.json();
      res.json({ code: data.response });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to connect to Python backend. Ensure pip dependencies are installed." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
