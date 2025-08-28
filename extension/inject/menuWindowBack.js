// Page messaging utilities
function pagePostMessage(type, data, contentWindow = window.parent) {
   contentWindow.postMessage({ type, data }, "*");
}
function pageOnMessage(type, callback) {
   window.addEventListener("message", (event) => {
      if (event.data.type === type) {
         callback(event.data.data, event);
      }
   });
}

let isActive = false;

pageOnMessage("IF_IF_MENU_WINDOW_BACK_DRAG_ON", (data) => {
   isActive = true;
   // Send initial position when drag starts
   pagePostMessage("IF_C_MENU_WINDOW_MOVE", { x: data.x, y: data.y });
});

window.addEventListener("pointermove", (e) => {
   if (!isActive) return;
   pagePostMessage("IF_C_MENU_WINDOW_MOVE", { x: e.clientX, y: e.clientY });
});

window.addEventListener("pointerup", (e) => {
   if (!isActive) return;
   isActive = false;
   pagePostMessage("IF_C_MENU_WINDOW_BACK_ADD_AFTER", {});
   pagePostMessage("IF_C_MENU_WINDOW_MOVE", { x: e.clientX, y: e.clientY });
   pagePostMessage("IF_IF_MENU_WINDOW_END", { });
});