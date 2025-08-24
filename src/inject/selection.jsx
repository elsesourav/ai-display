import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Select from "./Select.jsx";
import "./selection.css";

export function App() {
   return (
      <StrictMode>
         <div className="w-full h-full bg-transparent">
            <Select />
         </div>
      </StrictMode>
   );
}

createRoot(document.getElementById("root")).render(<App />);
