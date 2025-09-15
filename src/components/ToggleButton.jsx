import { useEffect, useState } from "react";
import extensionUtils from "./../utils/utilsModule.js";

export default function ToggleButton() {
   const [checked, setChecked] = useState(false);
   const [settings, setSettings] = useState({
      enable: false,
   });
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      setIsLoading(true);

      extensionUtils.chromeStorageGetLocal(
         extensionUtils.KEYS.SETTINGS,
         (settings) => {
            if (settings) {
               setSettings(settings);
               setChecked(settings.enable);
            }
            setIsLoading(false);
         }
      );
   }, []);

   useEffect(() => {
      settings.enable = checked;
      extensionUtils.chromeStorageSetLocal(
         extensionUtils.KEYS.SETTINGS,
         settings,
         () => {
            extensionUtils.runtimeSendMessage("P_B_TOGGLE");
         }
      );
   }, [settings, checked]);

   const handleClick = () => {
      setChecked(!checked);
   };

   if (isLoading) {
      return (
         <div className="w-full">
            <div className="relative w-full h-16 rounded-xl bg-gray-100 dark:bg-gray-800 grid place-items-center border border-gray-200 dark:border-gray-700">
               <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1">
                     🔄 Loading Settings...
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                     Please wait
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full">
         <div
            className="animated-button relative w-full h-16 rounded-xl grid place-items-center shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={handleClick}
         >
            <div className="flex items-center justify-between w-full px-6 pointer-events-none">
               <div className="flex flex-col items-start">
                  <span className="font-bold text-xl text-white z-4 relative leading-tight">
                     AI Display
                  </span>
                  <span className="text-sm text-white/80 z-4 relative">
                     {checked ? "Active on web pages" : "Click to activate"}
                  </span>
               </div>

               <div className="flex items-center space-x-3">
                  <span
                     className={`text-xs font-medium w-10 text-center py-1 rounded-full transition-all duration-300 border backdrop-blur-sm ${
                        checked
                           ? "bg-white/20 text-white border-white/30 shadow-sm"
                           : "bg-black/10 text-white/60 border-white/20"
                     }`}
                  >
                     {checked ? "ON" : "OFF"}
                  </span>
                  <input
                     type="checkbox"
                     id="main-toggle"
                     checked={checked}
                     onChange={() => {}}
                     className="scale-125 pointer-events-none"
                     style={{
                        "--switch-color-off": "var(--toggle-switch-off)",
                        "--switch-color-on": "var(--toggle-switch-on)",
                     }}
                  />
               </div>
            </div>
         </div>
      </div>
   );
}
