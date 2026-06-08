/*
  This script runs in the ISOLATED world.
  It reads the alwaysActiveEnabled flag from chrome.storage.local
  and sets all feature flags on the hidden DOM port element so that
  alwaysActiveMain.js (running in MAIN world) can read them.

  The reference extension stores individual feature flags (blur, focus, etc.)
  but since we always want ALL options active, we hardcode them all to true
  whenever the feature is enabled.
*/

let port;
try {
  port = document.getElementById("lwys-ctv-port");
  port.remove();
} catch (e) {
  port = document.createElement("span");
  port.id = "lwys-ctv-port";
  document.documentElement.append(port);
}
port.dataset.hidden = document.hidden;
port.dataset.enabled = "false";

port.addEventListener("state", () => {
  port.dataset.hidden = document.hidden;
});

const update = () =>
  chrome.storage.local.get(
    {
      alwaysActiveEnabled: "false",
    },
    (prefs) => {
      // chromeStorageSetLocal in utils.js stores values as JSON.stringify'd strings
      // so true becomes "true" (a JSON string), which chrome.storage stores as the string '"true"'
      // We need to handle both raw boolean and stringified JSON
      let enabled = prefs.alwaysActiveEnabled;
      if (typeof enabled === "string") {
        try {
          enabled = JSON.parse(enabled);
        } catch (e) {}
      }
      const isOn = enabled === true || enabled === "true";

      port.dataset.enabled = isOn ? "true" : "false";

      // All features are always ON when enabled (user requested no per-feature toggles)
      port.dataset.blur = "true";
      port.dataset.focus = "true";
      port.dataset.redirect = "true";
      port.dataset.mouseleave = "true";
      port.dataset.mouseout = "true";
      port.dataset.visibility = "true";
      port.dataset.pointercapture = "true";
    },
  );
update();
chrome.storage.onChanged.addListener(update);

if (window.top === window) {
  chrome.runtime.sendMessage({
    type: "P_B_SET_ALWAYS_ACTIVE_ICON",
  });
}
