// Page messaging utilities
function pagePostMessage(type, data, contentWindow = window.parent) {
   contentWindow.postMessage({ type, data }, "*");
}

pagePostMessage("IF_IF_RESET", { msg: "Hello from menuWindowBack.js" });