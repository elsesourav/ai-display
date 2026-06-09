/*
  This script runs in the ISOLATED world.
  It reads the alwaysActiveHosts array from chrome.storage.local
  and checks if the current page's hostname is in the list.
  If yes, it enables all spoofing features via the hidden DOM port element
  so that alwaysActiveMain.js (running in MAIN world) can read them.

  All feature flags are hardcoded to true (no per-feature toggles).
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

const update = () => {
  chrome.storage.local.get(["alwaysActiveHosts"], (result) => {
    // chromeStorageSetLocal wraps values with JSON.stringify,
    // so the stored value is a JSON string like '["example.com"]'
    let hosts = result.alwaysActiveHosts;

    // Parse the stringified JSON if needed
    if (typeof hosts === "string") {
      try {
        hosts = JSON.parse(hosts);
      } catch (e) {
        hosts = [];
      }
    }
    if (!Array.isArray(hosts)) {
      hosts = [];
    }

    // Get the current hostname (use parent for iframes)
    let hostname = location.hostname;
    try {
      hostname = parent.location.hostname;
    } catch (e) {}

    // Check if this hostname is in the active list
    const isActive = hosts.includes(hostname) || hosts.includes("*");

    port.dataset.enabled = isActive ? "true" : "false";

    // All features are always ON when enabled (no per-feature toggles)
    port.dataset.blur = "true";
    port.dataset.focus = "true";
    port.dataset.redirect = "true";
    port.dataset.mouseleave = "true";
    port.dataset.mouseout = "true";
    port.dataset.visibility = "true";
    port.dataset.pointercapture = "true";
  });
};
update();
chrome.storage.onChanged.addListener(update);

if (window.top === window) {
  chrome.runtime.sendMessage({
    type: "P_B_SET_ALWAYS_ACTIVE_ICON",
  });
}
