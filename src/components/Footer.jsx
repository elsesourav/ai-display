import "../assets/icons/css/icon.css";

export default function Footer() {
   const socialLinks = [
      {
         name: "GitHub",
         url: "https://github.com/elsesourav",
         icon: "sbi-github",
         color: "text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100",
      },
      {
         name: "Instagram",
         url: "https://instagram.com/elsesourav",
         icon: "sbi-instagram",
         color: "text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300",
      },
      {
         name: "Facebook",
         url: "https://facebook.com/elsesourav",
         icon: "sbi-facebook",
         color: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
      },
      {
         name: "LinkedIn",
         url: "https://linkedin.com/in/elsesourav",
         icon: "sbi-linkedin",
         color: "text-blue-700 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400",
      },
      {
         name: "X (Twitter)",
         url: "https://x.com/elsesourav",
         icon: "sbi-twitter",
         color: "text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white",
      },
      {
         name: "Gmail",
         url: "mailto:elsesourav@gmail.com",
         icon: "sbi-gmail",
         color: "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300",
      },
   ];

   const openLink = (url) => {
      // eslint-disable-next-line no-undef
      if (typeof chrome !== "undefined" && chrome.tabs) {
         // eslint-disable-next-line no-undef
         chrome.tabs.create({ url });
      } else {
         window.open(url, "_blank");
      }
   };

   return (
      <footer className="mt-8 pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
         <div className="text-center space-y-3">
            {/* Copyright */}
            <div className="text-xs text-gray-600 dark:text-gray-400">
               © 2025 AI Display
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
               Developed by{" "}
               <span className="inline-block font-bold">
                  elsesourav
               </span>
            </div>

            {/* Social Links */}
            <div className="flex justify-center items-center space-x-3">
               {socialLinks.map((link) => (
                  <button
                     key={link.name}
                     onClick={() => openLink(link.url)}
                     className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                     title={`Visit ${link.name}`}
                  >
                     <i
                        className={`${link.icon} text-lg ${link.color} transition-colors duration-200`}
                     ></i>
                  </button>
               ))}
            </div>

            {/* Contact Info */}
            <div className="text-xs text-gray-500 dark:text-gray-500">
               Follow me on social media
            </div>
         </div>
      </footer>
   );
}
