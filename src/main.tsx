import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <App />
  </Suspense>
);
