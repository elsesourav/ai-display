import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Menu from "./Menu.jsx";
import "./menuWindow.css";

export function App() {
   return (
      <StrictMode>
         <Menu />
      </StrictMode>
   );
}

createRoot(document.getElementById("root")).render(<App />);
