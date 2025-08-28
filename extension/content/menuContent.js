pageOnMessage("I_C_RESIZE_IFRAME", (data) => {
   const frame = document.getElementById("menuWindowIframe");
   if (!frame) return;
   frame.style.width = data.width;
   frame.style.height = data.height;
   frame.style.left = data.x;
   frame.style.top = data.y;
});

window.addEventListener("message", (event) => {
   if (event.data?.type.includes("IF_IF_")) {
      console.log("Parent got:", event.data);

   }

   // if (event.source === frame1) {
   //    frame2.postMessage(event.data, "*");
   // } else if (event.source === frame2) {
   //    frame1.postMessage(event.data, "*");
   // }
});

// pageOnMessage("_RESIZE_", (data) => {
//    const frame = document.getElementById("menuWindowBackIframe");
//    if (!frame) return;
//    frame.style.width = data.width;
//    frame.style.height = data.height;
//    frame.style.left = data.x;
//    frame.style.top = data.y;
// });
