const frame = document.createElement("iframe");

self.execute = ({ imageData, rectInfo }) => {
   frame.src = chrome.runtime.getURL("/inject/inject.html");
   frame.style.display = "none";
   frame.onload = () => {
      console.log("frame loaded");
      pagePostMessage("I_C_OCR", { imageData, rectInfo }, frame.contentWindow);
   };
   document.documentElement.append(frame);
};

pageOnMessage("C_I_OCR", async ({ imageData, rectInfo }) => {
   self.execute({ imageData, rectInfo });
});

pageOnMessage("C_I_REMOVE_IFRAME", async () => {
   if (frame) {
      frame.remove();
   }
});
