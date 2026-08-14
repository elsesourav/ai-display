import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "../hooks/useTheme.jsx";
import PopOuter from "./PopOuter.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
         <PopOuter />
      </ThemeProvider>
   </StrictMode>
);
