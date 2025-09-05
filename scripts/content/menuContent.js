const pointerOffset = { x: 0, y: 0 };
const iframePosition = { x: 0, y: 0 };
const iframeSize = { width: "160px", height: "50px" };

const applyCollisionDetection = (left, top) => {
   const menuWidth = parseInt(iframeSize.width);
   const menuHeight = parseInt(iframeSize.height);
   const vw = window.innerWidth;
   const vh = window.innerHeight;

   const constrainedLeft = Math.max(0, Math.min(left, vw - menuWidth));
   const constrainedTop = Math.max(0, Math.min(top, vh - menuHeight));

   return { x: constrainedLeft, y: constrainedTop };
};

pageOnMessage("IF_C_MENU_WINDOW_MOVE", (data) => {
   const frame = document.getElementById("menuWindowIframe");
   if (!frame) return;
   const constrainedPosition = applyCollisionDetection(
      data.x - pointerOffset.x,
      data.y - pointerOffset.y
   );
   frame.style.left = `${constrainedPosition.x}px`;
   frame.style.top = `${constrainedPosition.y}px`;
});

pageOnMessage("IF_C_MENU_WINDOW_BACK_RESIZE", (data) => {
   const frame = document.getElementById("menuWindowBackIframe");
   if (!frame) return;
   frame.style.width = data.width;
   frame.style.height = data.height;
   frame.style.left = data.x;
   frame.style.top = data.y;
});

pageOnMessage("IF_C_MENU_WINDOW_RESIZE", (data) => {
   const frame1 = document.getElementById("menuWindowIframe");
   const iframe2 = document.getElementById("menuWindowBackIframe");
   if (!frame1 || !iframe2) return;
   iframeSize.width = data.width;
   iframeSize.height = data.height;

   const constrainedPosition = applyCollisionDetection(
      iframePosition.x,
      iframePosition.y
   );

   iframePosition.x = constrainedPosition.x;
   iframePosition.y = constrainedPosition.y;
   frame1.style.left = `${constrainedPosition.x}px`;
   frame1.style.top = `${constrainedPosition.y}px`;

   frame1.style.transition =
      "left 300ms ease, top 300ms ease, width 300ms ease, height 300ms ease";
   frame1.style.width = iframeSize.width;
   frame1.style.height = iframeSize.height;
   setTimeout(() => {
      frame1.style.transition = "";
   }, 300);

   // resize and position the back iframe
   pagePostMessage(
      "C_IF_MENU_WINDOW_BACK_RESIZE",
      {
         width: iframeSize.width,
         height: iframeSize.height,
         ...constrainedPosition,
      },
      iframe2.contentWindow
   );
   iframe2.style.left = `${constrainedPosition.x}px`;
   iframe2.style.top = `${constrainedPosition.y}px`;
});

pageOnMessage("IF_C_MENU_WINDOW_BACK_MOVE", (data) => {
   const frame1 = document.getElementById("menuWindowIframe");
   if (!frame1) return;
   const constrainedPosition = applyCollisionDetection(
      data.x - pointerOffset.x,
      data.y - pointerOffset.y
   );
   iframePosition.x = constrainedPosition.x;
   iframePosition.y = constrainedPosition.y;
   frame1.style.left = `${constrainedPosition.x}px`;
   frame1.style.top = `${constrainedPosition.y}px`;
});

// Relay messages between the two iframes
window.addEventListener("message", (event) => {
   if (event?.data?.type?.includes("IF_IF_")) {
      console.log("Relaying message:", event.data);

      const iframe1 =
         document.getElementById("menuWindowIframe")?.contentWindow;
      const iframe2 = document.getElementById(
         "menuWindowBackIframe"
      )?.contentWindow;
      if (!iframe1 || !iframe2) return;

      if (event.source === iframe1) {
         iframe2.postMessage(event.data, "*");
      } else if (event.source === iframe2) {
         iframe1.postMessage(event.data, "*");
      }
   } else if (event?.data?.type?.includes("IF_B_")) {
      console.log("Received message from background:", event.data);

      runtimeSendMessage(event.data.type, { ...event.data }, (res) => {
         const iframe =
            document.getElementById("menuWindowIframe")?.contentWindow;
         console.log(res);

         pagePostMessage(event.data.type, res, iframe);
      });
   }
});

// pageOnMessage("IF_C_ACTIVE_MENU_WINDOW_BACK", () => {
//    console.log("Activating menu window back");
//    const frame = document.getElementById("menuWindowBackIframe");
//    if (!frame) return;
//    frame.style.display = "block";
// });

// pageOnMessage("IF_C_HIDE_MENU_WINDOW_BACK", () => {
//    console.log("Hiding menu window back");
//    const frame = document.getElementById("menuWindowBackIframe");
//    if (!frame) return;
//    frame.style.display = "none";
// });

// pageOnMessage("IF_C_MENU_WINDOW_BACK_ADD_BEFORE", ({ x, y, w, h }) => {
//    const frame = document.getElementById("menuWindowIframe");
//    if (!frame) return;
//    frame.style.zIndex = "825003262";
//    frame.style.pointerEvents = "none";
//    pointerOffset.x = x;
//    pointerOffset.y = y;
//    iframeSize.width = w;
//    iframeSize.height = h;
// });

// pageOnMessage("IF_C_MENU_WINDOW_BACK_ADD_AFTER", () => {
//    const frame = document.getElementById("menuWindowIframe");
//    if (!frame) return;
//    frame.style.zIndex = "825003264";
//    frame.style.pointerEvents = "auto";
// });

// pageOnMessage("_RESIZE_", (data) => {
//    const frame = document.getElementById("menuWindowBackIframe");
//    if (!frame) return;
//    frame.style.width = data.width;
//    frame.style.height = data.height;
//    frame.style.left = data.x;
//    frame.style.top = data.y;
// });
