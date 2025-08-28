pageOnMessage("I_C_RESIZE_IFRAME", (data) => {
   const frame = document.getElementById("menuWindowIframe");
   if (!frame) return;
   frame.style.width = data.width;
   frame.style.height = data.height;
   frame.style.left = data.x;
   frame.style.top = data.y;
});

// Relay messages between the two iframes
window.addEventListener("message", (event) => {
   if (event?.data?.type.includes("IF_IF_")) {
      console.log("Relaying message:", event.data);
      
      const iframe1 = document.getElementById("menuWindowIframe");
      const iframe2 = document.getElementById("menuWindowBackIframe");
      if (!iframe1 || !iframe2) return;

      if (event.source === iframe1.contentWindow) {
         iframe2.postMessage(event.data, "*");
      } else if (event.source === iframe2.contentWindow) {
         iframe1.postMessage(event.data, "*");
      }
   }
});

// pageOnMessage("_RESIZE_", (data) => {
//    const frame = document.getElementById("menuWindowBackIframe");
//    if (!frame) return;
//    frame.style.width = data.width;
//    frame.style.height = data.height;
//    frame.style.left = data.x;
//    frame.style.top = data.y;
// });
