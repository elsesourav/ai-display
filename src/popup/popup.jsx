import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PopOuter from "./PopOuter.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <PopOuter />
   </StrictMode>
);
