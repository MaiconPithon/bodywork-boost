import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Tratamento global de ChunkLoadError (deploy com cache antigo)
window.addEventListener("error", (event) => {
  if (
    event.message?.includes("ChunkLoadError") ||
    event.message?.includes("Failed to fetch dynamically imported module") ||
    event.message?.includes("Loading chunk")
  ) {
    console.warn("ChunkLoadError detectado. Recarregando...");
    window.location.reload();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason?.message || "";
  if (
    message.includes("ChunkLoadError") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Loading chunk")
  ) {
    console.warn("ChunkLoadError (promise) detectado. Recarregando...");
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
