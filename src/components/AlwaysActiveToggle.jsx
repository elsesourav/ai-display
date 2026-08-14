import { useEffect, useState } from "react";
import extensionUtils from "./../utils/utilsModule.js";

export default function AlwaysActiveToggle() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      // Get the active tab's hostname
      const tab = await extensionUtils.getActiveTab();
      let hostname = "";
      if (tab && tab.url?.startsWith("http")) {
        try {
          hostname = new URL(tab.url).hostname;
        } catch {
          // ignore invalid url
        }
      }

      // Check if hostname is in the list of active hosts
      extensionUtils.chromeStorageGetLocal(
        extensionUtils.KEYS.ALWAYS_ACTIVE_HOSTS,
        (hosts) => {
          const activeHosts = hosts || [];
          if (
            hostname &&
            (activeHosts.includes(hostname) || activeHosts.includes("*"))
          ) {
            setChecked(true);
          } else {
            setChecked(false);
          }
        }
      );
    };

    checkStatus();
  }, []);

  const handleClick = () => {
    // Optimistically toggle UI
    setChecked(!checked);
    extensionUtils.runtimeSendMessage("P_B_TOGGLE_ALWAYS_ACTIVE");
  };

  return (
    <div className="w-full mt-2">
      <div
        className={`animated-button relative w-full h-16 rounded-xl grid place-items-center shadow-lg transition-[filter,opacity] duration-150 overflow-hidden cursor-pointer ${
          !checked ? "grayscale opacity-80" : ""
        }`}
        style={{
          "--button-gradient-start": "#f97316",
          "--button-gradient-end": "#dc2626",
        }}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between w-full px-6 pointer-events-none">
          <div className="flex flex-col items-start">
            <span className="font-bold text-xl text-white z-4 relative leading-tight">
              Always Active Tab
            </span>
            <span className="text-sm text-white/80 z-4 relative">
              {checked ? "Keeps tab active in background" : "Prevent tab pausing & sleep"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
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
