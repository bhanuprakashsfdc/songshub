import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MovieProvider } from "@/context/MovieContext";
import { MusicProvider } from "@/context/MusicContext";
import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MovieProvider>
        <MusicProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </MusicProvider>
      </MovieProvider>
    </BrowserRouter>
  </StrictMode>
);
