import { useEffect, useState } from "react";

const getInitialTheme = () => {
   const theme = localStorage.getItem("theme");
   if (!theme) {
      localStorage.setItem("theme", "dark-theme");
      return "dark-theme";
   }
   return theme;
};

export const useTheme = () => {
   const [theme, setTheme] = useState(getInitialTheme);
   const isDarkMode = theme === "dark-theme";

   const toggleTheme = () => {
      setTheme((prevTheme) =>
         prevTheme === "dark-theme" ? "light-theme" : "dark-theme"
      );
   };

   useEffect(() => {
      localStorage.setItem("theme", theme);
      document.documentElement.className = theme; 
   }, [theme]);

   return { theme, isDarkMode, toggleTheme };
};
