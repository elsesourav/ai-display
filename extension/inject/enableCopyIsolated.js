/*
  This script runs in the ISOLATED world.
  It reads the enableCopyHosts array from chrome.storage.local
  and checks if the current page's hostname is in the list.
  If yes, it sets dataset.enabled = "true" on the hidden DOM port element
  so that enableCopyMain.js (running in MAIN world) activates.
*/

let port;
try {
  port = document.getElementById("enable-copy-port");
  if (!port) {
    port = document.createElement("span");
    port.id = "enable-copy-port";
    port.style.display = "none";
    document.documentElement.append(port);
  }
} catch (e) {
  port = document.createElement("span");
  port.id = "enable-copy-port";
  port.style.display = "none";
  document.documentElement.append(port);
}

const update = () => {
  if (typeof chrome === "undefined" || !chrome.storage?.local || !chrome.runtime?.id) return;

  chrome.storage.local.get(["enableCopyHosts"], (result) => {
    let hosts = result.enableCopyHosts;

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

    let hostname = location.hostname;
    try {
      hostname = parent.location.hostname;
    } catch (e) {}

    const isActive = hosts.includes(hostname) || hosts.includes("*");
    const wasEnabled = port.dataset.enabled === "true";
    port.dataset.enabled = isActive ? "true" : "false";

    if (wasEnabled !== isActive) {
      port.dispatchEvent(new CustomEvent("change"));
    }
  });
};

update();
if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener(update);
}
