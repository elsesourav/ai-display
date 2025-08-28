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

// let isActive = false;

// pageOnMessage("IF_IF_MENU_WINDOW_BACK_DRAG_ON", () => {
//    isActive = true;
// });

// window.addEventListener("pointermove", (e) => {
//    if (!isActive) return;
//    pagePostMessage("IF_C_MENU_WINDOW_MOVE", { x: e.clientX, y: e.clientY });
// });

// window.addEventListener("pointerup", (e) => {
//    if (!isActive) return;
//    isActive = false;
//    pagePostMessage("IF_C_MENU_WINDOW_BACK_ADD_AFTER", {});
//    pagePostMessage("IF_C_MENU_WINDOW_MOVE", { x: e.clientX, y: e.clientY });
//    pagePostMessage("IF_IF_MENU_WINDOW_END", { });
// });

// Handle element inside iframe used to drag
const DRAG_HANDLE = document.getElementById("DRAG_HANDLE");

// State flags
let isExpanded = false; // whether iframe is currently expanded to full viewport
let isDragging = false; // whether a drag gesture is active
let iframePosition = { x: 0, y: 0 }; // last committed iframe left/top in parent
let pointerOffset = { x: 0, y: 0 }; // pointer offset from handle's top-left during drag
let collapsePending = false; // set true on pointerup; collapse on subsequent pointerleave
let expandTimer = null;
const delayDuration = 50;
const boundarySize = { width: 160, height: 50 };

// Collision detection function to keep DRAG_HANDLE within viewport bounds
const applyCollisionDetection = (left, top) => {
   const menuWidth = boundarySize.width;
   const menuHeight = boundarySize.height;

   // Get viewport dimensions
   const VW = window.innerWidth || window.parent.clientWidth;
   const VH = window.innerHeight || window.parent.clientHeight;

   // Constrain position to viewport bounds
   const constrainedLeft = Math.max(0, Math.min(left, VW - menuWidth));
   const constrainedTop = Math.max(0, Math.min(top, VH - menuHeight));

   return { x: constrainedLeft, y: constrainedTop };
};

pageOnMessage("C_IF_MENU_WINDOW_BACK_RESIZE", (data) => {
   boundarySize.width = parseInt(data.width);
   boundarySize.height = parseInt(data.height);
   iframePosition.x = parseInt(data.x);
   iframePosition.y = parseInt(data.y);

   DRAG_HANDLE.style.left = "0px";
   DRAG_HANDLE.style.top = "0px";
});

// Expand iframe to full viewport so pointer events aren't clipped
const expandIframeToViewport = () => {
   clearTimeout(expandTimer);
   pagePostMessage("IF_C_MENU_WINDOW_BACK_RESIZE", {
      width: "100svw",
      height: "100svh",
      x: "0px",
      y: "0px",
   });
   DRAG_HANDLE.style.left = `${iframePosition.x}px`;
   DRAG_HANDLE.style.top = `${iframePosition.y}px`;
};

// Shrink iframe back to fixed size at the committed position
const shrinkIframeToBox = () => {
   clearTimeout(expandTimer);

   expandTimer = setTimeout(() => {
      const left = Number.parseFloat(DRAG_HANDLE.style.left) || 0;
      const top = Number.parseFloat(DRAG_HANDLE.style.top) || 0;
      iframePosition = { x: Math.round(left), y: Math.round(top) };
      pagePostMessage("IF_C_MENU_WINDOW_BACK_RESIZE", {
         width: "50px",
         height: "50px",
         x: `${iframePosition.x}px`,
         y: `${iframePosition.y}px`,
      });
      DRAG_HANDLE.style.left = "0px";
      DRAG_HANDLE.style.top = "0px";
   }, delayDuration);
};

// Expand on hover
DRAG_HANDLE.addEventListener("pointerenter", () => {
   if (isExpanded) return;
   isExpanded = true;
   expandIframeToViewport();
});

// Collapse when leaving (only if not dragging)
DRAG_HANDLE.addEventListener("pointerleave", () => {
   if (!isExpanded || isDragging) return;
   isExpanded = false;
   shrinkIframeToBox();
});

// Start drag on press
DRAG_HANDLE.addEventListener("pointerdown", (e) => {
   if (!isExpanded) {
      isExpanded = true;
      expandIframeToViewport();
   }
   isDragging = true;
   const rect = DRAG_HANDLE.getBoundingClientRect();
   pointerOffset.x = e.clientX - rect.left;
   pointerOffset.y = e.clientY - rect.top;
   if (DRAG_HANDLE.setPointerCapture)
      DRAG_HANDLE.setPointerCapture(e.pointerId);
});

// Move handle with pointer
window.addEventListener("pointermove", (e) => {
   if (!isDragging) return;
   const newLeft = e.clientX - pointerOffset.x;
   const newTop = e.clientY - pointerOffset.y;

   // Apply collision detection to keep DRAG_HANDLE within viewport
   const constrainedPosition = applyCollisionDetection(newLeft, newTop);

   DRAG_HANDLE.style.left = `${constrainedPosition.x}px`;
   DRAG_HANDLE.style.top = `${constrainedPosition.y}px`;
   pagePostMessage("IF_C_MENU_WINDOW_BACK_MOVE", {
      x: constrainedPosition.x,
      y: constrainedPosition.y,
   });
});

// End drag on release; collapse after subsequent leave
DRAG_HANDLE.addEventListener("pointerup", (e) => {
   if (!isDragging) return;
   isDragging = false;
   isExpanded = false;
   collapsePending = true;
   if (DRAG_HANDLE.releasePointerCapture)
      DRAG_HANDLE.releasePointerCapture(e.pointerId);

   const left = Number.parseFloat(DRAG_HANDLE.style.left) || 0;
   const top = Number.parseFloat(DRAG_HANDLE.style.top) || 0;

   // Apply collision detection to final position
   const constrainedPosition = applyCollisionDetection(left, top);
   DRAG_HANDLE.style.left = `${constrainedPosition.x}px`;
   DRAG_HANDLE.style.top = `${constrainedPosition.y}px`;

   pagePostMessage("IF_C_MENU_WINDOW_BACK_MOVE", {
      x: constrainedPosition.x,
      y: constrainedPosition.y,
   });

   iframePosition = {
      x: Math.round(constrainedPosition.x),
      y: Math.round(constrainedPosition.y),
   };
});

// After pointerup, wait for pointer to leave handle, then shrink iframe
DRAG_HANDLE.addEventListener("pointerleave", () => {
   if (!collapsePending) return;
   collapsePending = false;
   shrinkIframeToBox();
});
