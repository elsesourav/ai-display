import { DarkModeSwitch } from "react-toggle-dark-mode";
import { useTheme } from "../hooks/useThemeHook.jsx";

export default function Header() {
   const { theme, setTheme } = useTheme();

   const isDarkMode =
      theme === "dark" ||
      (theme === "system" &&
         window.matchMedia("(prefers-color-scheme: dark)").matches);

   const toggleTheme = (checked) => {
      setTheme(checked ? "dark" : "light");
   };

   return (
      <div>
         <header className="relative w-full">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-md shadow w-full px-4">
               <div className="flex h-16 items-center justify-between">
                  <div className="size-10">
                     <img src="./../assets/icons/icon.png" alt="icon" />
                  </div>
                  <h1 className="bg-gradient-to-l from-purple-500 via-orange-400 to-pink-500 inline-block text-transparent bg-clip-text font-black text-2xl text-shadow-lg/10 text-shadow-black">
                     AI Display
                  </h1>
                  <div className="size-10 rounded-xl grid place-items-center transition-colors duration-300 dark:bg-black/40 dark:hover:bg-black/50 bg-black/20 hover:bg-black/30">
                     <DarkModeSwitch
                        className="relative size-8 cursor-pointer transition-all duration-300 scale-100 hover:scale-95"
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        size={28}
                        sunColor="#f59e0b"
                        moonColor="#3b82f6"
                     />
                  </div>
               </div>
            </div>
         </header>
      </div>
   );
}
