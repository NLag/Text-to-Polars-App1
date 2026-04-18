/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Loader2, Play, GitBranch, Terminal } from "lucide-react";

export default function App() {
  const [prompt, setPrompt] = useState("Group by 'department' and calculate the mean of 'salary'.");
  const [schema, setSchema] = useState("{ \"columns\": [\"department\", \"salary\", \"employee_id\"] }");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setGeneratedCode("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, schema }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }
      
      setGeneratedCode(data.code);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-blue-500/30">
      <header className="border-b border-white/10 bg-black/50 p-6 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight">PolarsBench Agent Workspace</h1>
              <p className="text-sm text-neutral-400">Environment for testing your Python Agent before GitHub export</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Agent Input Panel */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                Natural Language Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl bg-neutral-900 border border-white/10 p-4 text-sm font-mono text-neutral-200 placeholder:text-neutral-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                placeholder="e.g. Find the top 5 longest trips..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                Dataset Schema / Context <span className="text-xs text-neutral-500">(Optional)</span>
              </label>
              <textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl bg-neutral-900 border border-white/10 p-4 text-sm font-mono text-neutral-200 placeholder:text-neutral-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                placeholder="{ ... schema config ... }"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-all hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-white/10"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Executing Agent...</>
              ) : (
                <><Play className="h-4 w-4" /> Generate Polars Code</>
              )}
            </button>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200">
              <h3 className="font-medium mb-1">Export Instructions</h3>
              <p className="text-blue-300/80 leading-relaxed mb-3">
                This project includes the full Python repository structured for PolarsBench in its root directory.
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                <li><code className="bg-blue-950 px-1 py-0.5 rounded">main.py</code> - FastAPI Application</li>
                <li><code className="bg-blue-950 px-1 py-0.5 rounded">pyproject.toml</code> - Environment config</li>
                <li><code className="bg-blue-950 px-1 py-0.5 rounded">requirements.txt</code> - Explicit dependencies</li>
              </ul>
            </div>
          </div>

          {/* Outcome Panel */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-neutral-900/50 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-3">
              <Terminal className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Output .py</span>
            </div>
            
            <div className="flex-1 p-0 relative min-h-[400px]">
              {error ? (
                <div className="absolute inset-x-4 top-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 overflow-auto whitespace-pre-wrap">
                  {error}
                </div>
              ) : generatedCode ? (
                <pre className="p-6 text-sm font-mono text-neutral-300 overflow-auto h-full w-full absolute inset-0">
                  <code>{generatedCode}</code>
                </pre>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-neutral-600">
                  Awaiting generation...
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
