import { useEffect, useState } from "react";
import extensionUtils from "../utils/utilsModule.js";

export default function OptionsApp() {
   const [devMode, setDevMode] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      extensionUtils.chromeStorageGetLocal(
         extensionUtils.KEYS.CONTROLS,
         (controlsData) => {
            if (controlsData && controlsData.devMode !== undefined) {
               setDevMode(controlsData.devMode);
            }
            setIsLoading(false);
         }
      );
   }, []);

   const handleToggleDevMode = (newVal) => {
      setDevMode(newVal);
      extensionUtils.chromeStorageGetLocal(
         extensionUtils.KEYS.CONTROLS,
         (controlsData) => {
            const data = controlsData || {};
            data.devMode = newVal;
            extensionUtils.chromeStorageSetLocal(
               extensionUtils.KEYS.CONTROLS,
               data
            );
         }
      );
   };

   if (isLoading) {
      return <div className="p-8 text-center font-semibold text-gray-600 dark:text-gray-300">Loading settings...</div>;
   }

   return (
      <div className="max-w-2xl mx-auto p-8 mt-10">
         <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">AI Display - Options</h1>
         
         <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Advanced Settings</h2>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800">
               <div className="flex flex-col flex-1 pr-6">
                  <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                     Developer Mode
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                     Show detailed error logs in the extension console for debugging and troubleshooting. Not recommended for daily use.
                  </span>
               </div>
               
               <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                     type="checkbox"
                     className="sr-only peer"
                     checked={devMode}
                     onChange={(e) => handleToggleDevMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
               </label>
            </div>
         </div>
      </div>
   );
}
