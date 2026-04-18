import express from "express";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Python Execution Endpoint
  app.post("/api/generate", (req, res) => {
    const { prompt, schema } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const args = ["main.py", "--prompt", prompt];
    if (schema) {
      args.push("--schema", schema);
    }

    // Call the Python codebase using the system's python3 executable
    const pyProcess = spawn("python3", args, {
      cwd: process.cwd(),
      env: { ...process.env }, // Propagate GEMINI_API_KEY and others
    });

    let output = "";
    let errorOutput = "";

    pyProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Agent execution failed:", errorOutput);
        
        // Handle uninstalled package (if python deps missing)
        if (errorOutput.includes("ModuleNotFoundError")) {
             return res.status(500).json({ error: errorOutput + "\n\nTip: You need to install Python dependencies. Run: pip install -r requirements.txt" });
        }
        
        return res.status(500).json({ error: errorOutput || "Internal server error" });
      }
      res.json({ code: output.trim() });
    });
  });

  // Vite middleware for development UI
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
