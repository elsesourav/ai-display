/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import extensionUtils from "./../utils/utilsModule.js";

export default function ToggleButton() {
   const [checked, setChecked] = useState(false);
   const [settings, setSettings] = useState({
      enable: false,
   });

   useEffect(() => {
      extensionUtils.chromeStorageGetLocal(extensionUtils.KEYS.SETTINGS, (settings) => {
         if (settings) {
            setSettings(settings);
            setChecked(settings.enable);
         }
      });
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
   }, [checked]);

   const handleClick = (element) => {
      setChecked(element.checked);
   };

   return (
      <div className="flex flex-col items-center">
         <div
            className={`relative px-4 h-14 rounded-lg ${
               checked ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
            } grid place-items-center shadow-md transition-all duration-300`}
         >
            <input
               type="checkbox"
               className="absolute size-full opacity-0 cursor-pointer"
               onChange={(e) => handleClick(e.target)}
               checked={checked}
            />
            <p className="font-bold text-2xl">
               Ai {checked ? "Enable" : "Disable"}
            </p>
         </div>
      </div>
   );
}
