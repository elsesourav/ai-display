let worker;

function cropImage(imageData, { width, height, left, top }, mode = "normal") {
   return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
         canvas.width = width || img.width;
         canvas.height = height || img.height;
         if (width && height) {
            ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
         } else {
            ctx.drawImage(img, 0, 0);
         }
         if (mode === "invert" || mode === "gray") {
            ctx.globalCompositeOperation =
               mode === "gray" ? "saturation" : "difference";
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
         }

         resolve(canvas.toDataURL());
      };
      img.src = imageData;
   });
}

function readyWorker() {
   return new Promise(async (resolve) => {
      if (!worker) {
         try {
            worker = await Tesseract.createWorker("eng", 1, {
               workerBlobURL: false,
               workerPath: "OCR/worker.min.js",
               corePath: "OCR/Tesseract",
               langPath: "OCR/Lang/",
               logger: updateProgress,
            });

            console.log("ready worker");
         } catch (error) {
            console.error("Error creating worker:", error);
         } finally {
            resolve();
         }
      } else {
         resolve();
      }
   });
}

function updateProgress(packet) {
   return;
   const percent = Math.round(packet.progress * 100);
   const barLength = 20; // total segments in the bar
   const filledLength = Math.round((barLength * percent) / 100);
   const bar = "█".repeat(filledLength) + "-".repeat(barLength - filledLength);

   // Color setup (browser console)
   let color = "color: cyan;";
   if (packet.status === "recognizing text") color = "color: yellow;";
   if (packet.status === "loading tesseract core") color = "color: magenta;";
   if (packet.status === "loading language traineddata")
      color = "color: green;";
   if (packet.status === "initializing api") color = "color: blue;";
   if (packet.status === "initialized api") color = "color: lightgreen;";

   // Clear previous log and print the new progress bar
   console.clear();
   console.log(`%c[${bar}] ${percent}% - ${packet.status}`, color);
}

function processOCR(imageData, rectInfo) {
   const { devicePixelRatio, width, height, left, top } = rectInfo;
   const box = {
      width: width * devicePixelRatio,
      height: height * devicePixelRatio,
      left: left * devicePixelRatio,
      top: top * devicePixelRatio,
   };
   return new Promise(async (resolve) => {
      try {
         const promises = [cropImage(imageData, box), readyWorker()];
         Promise.all(promises).then(async ([croppedImage]) => {
            // console.log(croppedImage);
            
            const result = await worker.recognize(croppedImage);
            resolve(result.data.text);
         });
      } catch (error) {
         console.error("Error processing OCR:", error);
         resolve(null);
      }
   });
}

window.addEventListener("beforeunload", async () => {
   if (worker) {
      await worker.terminate();
   }
});

pageOnMessage("C_I_OCR", async ({ imageData, rectInfo }) => {
   // console.log(imageData, rectInfo);   
   const text = await processOCR(imageData, rectInfo);
   console.log(text);
   pagePostMessage("I_C_OCR_RESULT", { text });
});
