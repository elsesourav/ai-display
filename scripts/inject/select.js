const htmlContent = /* html */ `
   <div
      id="overlay"
      class="fixed bg-black/10 inset-0 cursor-crosshair hidden z-[9999]"
   >
      <div id="selectionBox" class="absolute pointer-events-none bg-blue-800/40"></div>

      <div id="desButtons" class="fixed right-2 bottom-2 p-1  hidden z-[10000] gap-2 opacity-70">
         <button
         id="confirmButton"
         class="border-0 size-12 rounded-lg cursor-pointer z-[10000] grid place-items-center bg-green-600 hover:bg-green-700 transition-all duration-300"
         >
            <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="35px" height="35px" viewBox="0 0 533.973 533.973" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M477.931,52.261c-12.821-12.821-33.605-12.821-46.427,0l-266.96,266.954l-62.075-62.069 c-12.821-12.821-33.604-12.821-46.426,0L9.616,303.572c-12.821,12.821-12.821,33.604,0,46.426l85.289,85.289l46.426,46.426 c12.821,12.821,33.611,12.821,46.426,0l46.426-46.426l290.173-290.174c12.821-12.821,12.821-33.605,0-46.426L477.931,52.261z"></path> </g> </g> </g></svg>
         </button>

         <button id="cancelButton" class="border-0 size-12 rounded-lg cursor-pointer z-[10000] grid place-items-center bg-red-600 hover:bg-red-700 transition-all duration-300">
            <svg width="30px" height="30px" viewBox="0 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cross</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-469.000000, -1041.000000)" fill="#ffffff"> <path d="M487.148,1053.48 L492.813,1047.82 C494.376,1046.26 494.376,1043.72 492.813,1042.16 C491.248,1040.59 488.712,1040.59 487.148,1042.16 L481.484,1047.82 L475.82,1042.16 C474.257,1040.59 471.721,1040.59 470.156,1042.16 C468.593,1043.72 468.593,1046.26 470.156,1047.82 L475.82,1053.48 L470.156,1059.15 C468.593,1060.71 468.593,1063.25 470.156,1064.81 C471.721,1066.38 474.257,1066.38 475.82,1064.81 L481.484,1059.15 L487.148,1064.81 C488.712,1066.38 491.248,1066.38 492.813,1064.81 C494.376,1063.25 494.376,1060.71 492.813,1059.15 L487.148,1053.48" id="cross" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
         </button>
      </div>
   </div>

   <div
      id="moveElement"
      class="fixed top-5 left-5 z-[10000] p-1 pl-3 w-24 bg-gray-800 text-white rounded-md shadow-md flex justify-between gap-2 cursor-grab opacity-70 hover:opacity-100 transition-opacity duration-300"
   >

      <div class="size-2"></div>

      <div id="openMenu" class="size-8 rounded-md cursor-pointer grid place-items-center bg-black/10 hover:bg-black/20 transition-all duration-300">
         <svg width="35px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 6H20M4 12H14M4 18H9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </div>


      <div id="startCapture" class="size-8 rounded-md cursor-pointer grid place-items-center bg-black/10 hover:bg-black/20 transition-all duration-300">
         <svg height="26px" width="26px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 382.975 382.975" xml:space="preserve" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path style="fill:none;" d="M346.566,24H36.407c-6.842,0-12.406,5.567-12.406,12.409v310.157c0,6.842,5.564,12.409,12.406,12.409 h310.158c6.842,0,12.408-5.567,12.408-12.409V36.409C358.974,29.567,353.408,24,346.566,24z M191.49,339.529 c-81.631,0-148.045-66.412-148.045-148.042c0-81.63,66.414-148.041,148.045-148.041c81.629,0,148.039,66.411,148.039,148.041 C339.529,273.117,273.118,339.529,191.49,339.529z"></path> <g> <path style="fill:#ffffff;" d="M346.566,0H36.407C16.333,0,0.001,16.333,0.001,36.409v310.157 c0,20.076,16.332,36.409,36.406,36.409h310.158c20.076,0,36.408-16.333,36.408-36.409V36.409C382.974,16.333,366.642,0,346.566,0z M358.974,346.566c0,6.842-5.566,12.409-12.408,12.409H36.407c-6.842,0-12.406-5.567-12.406-12.409V36.409 C24.001,29.567,29.566,24,36.407,24h310.158c6.842,0,12.408,5.567,12.408,12.409V346.566z"></path> <g> <path style="fill:#ff0000;" d="M191.49,67.446c-68.398,0-124.045,55.644-124.045,124.041 c0,68.397,55.646,124.042,124.045,124.042c68.396,0,124.039-55.645,124.039-124.042C315.529,123.09,259.886,67.446,191.49,67.446 z M191.49,289.855c-54.24,0-98.369-44.128-98.369-98.368c0-6.627,5.373-12,12-12c6.627,0,12,5.373,12,12 c0,41.007,33.363,74.368,74.369,74.368c6.627,0,12,5.372,12,12C203.49,284.482,198.117,289.855,191.49,289.855z"></path> <path style="fill:#ffffff;" d="M191.49,43.446c-81.631,0-148.045,66.411-148.045,148.041c0,81.63,66.414,148.042,148.045,148.042 c81.629,0,148.039-66.412,148.039-148.042C339.529,109.857,273.118,43.446,191.49,43.446z M191.49,315.529 c-68.398,0-124.045-55.645-124.045-124.042c0-68.397,55.646-124.041,124.045-124.041c68.396,0,124.039,55.644,124.039,124.041 C315.529,259.884,259.886,315.529,191.49,315.529z"></path> <path style="fill:#ffffff;" d="M191.49,265.855c-41.006,0-74.369-33.361-74.369-74.368c0-6.627-5.373-12-12-12 c-6.627,0-12,5.373-12,12c0,54.24,44.129,98.368,98.369,98.368c6.627,0,12-5.373,12-12 C203.49,271.227,198.117,265.855,191.49,265.855z"></path> </g> </g> </g> </g></svg>
      </div>

      <div id="takeSnapshot" class="size-8 rounded-md cursor-pointer place-items-center bg-black/10 hover:bg-black/20 transition-all duration-300 hidden">
         <svg fill="#000000" width="28px" height="28px" viewBox="0 0 24 24" id="screen-capture" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><circle id="secondary" cx="12" cy="12" r="3" style="fill: #2ca9bc; stroke-width: 2;"></circle><circle id="primary" cx="12" cy="12" r="3" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle><path id="primary-2" data-name="primary" d="M21,9V4a1,1,0,0,0-1-1H15" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-3" data-name="primary" d="M15,21h5a1,1,0,0,0,1-1V15" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-4" data-name="primary" d="M9,3H4A1,1,0,0,0,3,4V9" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-5" data-name="primary" d="M3,15v5a1,1,0,0,0,1,1H9" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
      </div>
   </div>

   <canvas id="display" class="fixed inset-0 z-[9998]"></canvas>


   <video id="screenVideo" autoplay class="hidden"></video>
`;

document.body.insertAdjacentHTML("beforeend", htmlContent);

const overlay = document.getElementById("overlay");
const selectionBox = document.getElementById("selectionBox");

const desButtons = document.getElementById("desButtons");
const confirmButton = document.getElementById("confirmButton");
const cancelButton = document.getElementById("cancelButton");

const moveElement = document.getElementById("moveElement");
const startCapture = document.getElementById("startCapture");
const takeSnapshot = document.getElementById("takeSnapshot");

const openMenu = document.getElementById("openMenu");
const video = document.getElementById("screenVideo");
const display = document.getElementById("display");
const ctx = display.getContext("2d");
display.width = window.innerWidth;
display.height = window.innerHeight;

let isStreaming = false;
let isSelecting = false,
   startX,
   startY,
   rect;

// Dragging the start button with boundary checks
let isDragging = false,
   dragOffsetX = 0,
   dragOffsetY = 0;

moveElement.addEventListener("mousedown", (e) => {
   isDragging = true;
   dragOffsetX = e.offsetX;
   dragOffsetY = e.offsetY;
});
document.addEventListener("mousemove", (e) => {
   if (isDragging) {
      let newLeft = e.clientX - dragOffsetX;
      let newTop = e.clientY - dragOffsetY;

      // Clamp to window bounds
      const maxLeft = window.innerWidth - moveElement.offsetWidth;
      const maxTop = window.innerHeight - moveElement.offsetHeight;

      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      moveElement.style.left = `${newLeft}px`;
      moveElement.style.top = `${newTop}px`;
   }
});
document.addEventListener("mouseup", () => {
   isDragging = false;
});

startCapture.addEventListener("click", async () => {
   try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
         video: true,
      });
      video.srcObject = stream;
      video.play();
      console.log("Screen capture started.");
      startCapture.style.display = "none";
      takeSnapshot.style.display = "grid";
      isStreaming = true;

      stream.getTracks().forEach((track) => {
         track.onended = () => {
            startCapture.style.display = "grid";
            takeSnapshot.style.display = "none";
            isStreaming = false;
            console.log("Stream has ended.");
         };
      });
   } catch (err) {
      console.error("Error:", err);
   }
});

takeSnapshot.addEventListener("click", () => {
   ctx.drawImage(video, 0, 0, display.width, display.height);
   display.style.display = "block";
   overlay.style.display = "block";
   desButtons.style.display = "none";
});

overlay.addEventListener("mousedown", (e) => {
   isSelecting = true;
   startX = e.clientX;
   startY = e.clientY;
   selectionBox.style.left = `${startX}px`;
   selectionBox.style.top = `${startY}px`;
   selectionBox.style.width = "0px";
   selectionBox.style.height = "0px";
});

overlay.addEventListener("mousemove", (e) => {
   if (!isSelecting) return;
   const width = e.clientX - startX;
   const height = e.clientY - startY;
   selectionBox.style.width = Math.abs(width) + "px";
   selectionBox.style.height = Math.abs(height) + "px";
   selectionBox.style.left = (width < 0 ? e.clientX : startX) + "px";
   selectionBox.style.top = (height < 0 ? e.clientY : startY) + "px";
});

overlay.addEventListener("mouseup", () => {
   if (isSelecting) {
      isSelecting = false;
      desButtons.style.display = "flex";
      rect = selectionBox.getBoundingClientRect();
   }
});

// Confirm by button or Enter
confirmButton.addEventListener("click", captureSelection);
document.addEventListener("keydown", (e) => {
   if (e.key === "Enter" && overlay.style.display === "block")
      captureSelection();
});

// Cancel by button or Esc
cancelButton.addEventListener("click", resetCapture);
document.addEventListener("keydown", (e) => {
   if (e.key === "Escape" && overlay.style.display === "block") resetCapture();
});

async function captureSelection() {
   moveElement.style.display = "none";
   overlay.style.display = "none";
   display.style.display = "none";

   // Create a temporary canvas to hold the cropped image
   const tempCanvas = document.createElement("canvas");
   tempCanvas.width = rect.width;
   tempCanvas.height = rect.height;
   const tempCtx = tempCanvas.getContext("2d");

   // Draw the selected portion onto the temporary canvas
   tempCtx.drawImage(
      display,
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
   );

   const imgData = tempCanvas.toDataURL("image/png");
   console.log(imgData);

   pagePostMessage("i_c_selected_image", { imgData });
   resetCapture();

   display.width = window.innerWidth;
   display.height = window.innerHeight;
   moveElement.style.display = "flex";
   overlay.style.display = "block";
}

function resetCapture() {
   overlay.style.display = "none";
   display.style.display = "none";
   desButtons.style.display = "none";
   selectionBox.style.width = "0px";
   selectionBox.style.height = "0px";
}
