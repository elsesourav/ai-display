// (async () => {
//    const MARGIN = 5;
//    const INACTIVITY_TIMEOUT = 30000;
//    const ANIMATION_DURATION = 400;

//    const w = {
//       width: window.innerWidth,
//       height: window.innerHeight,
//    };


//    const SZ = {
//       min: { w: "160px", h: "50px" },
//       max: { w: "380px", h: "560px" },
//    };
//    let isDragging = false;

//    let dragOffsetRef = {
//       current: { x: 0, y: 0 },
//    };

//    let newLeft = 0;
//    let newTop = 0;


//    pageOnMessage("C_I_RESIZE", async ({ data }) => {
//       const { w, h } = data;
//       w.width = w;
//       w.height = h;
//    });



//    const calculateOnScreenPosition = (rect, currentPosition, width, height) => {
//       let newX = currentPosition.x;
//       let newY = currentPosition.y;

//       if (rect.left + width > window.innerWidth - MARGIN) {
//          newX = window.innerWidth - width - MARGIN;
//       }
//       if (rect.left < MARGIN) {
//          newX = MARGIN;
//       }
//       if (rect.top + height > window.innerHeight - MARGIN) {
//          newY = window.innerHeight - height - MARGIN;
//       }
//       if (rect.top < MARGIN) {
//          newY = MARGIN;
//       }

//       return { x: newX, y: newY };
//    };

//    const calculateDragPosition = (e) => {
//       newLeft = e.clientX - dragOffsetRef.current.x || 0;
//       newTop = e.clientY - dragOffsetRef.current.y || 0;

//       console.log(e.clientX, e.clientY);

//       const currentWidth = parseInt(SZ.min.w);
//       const currentHeight = parseInt(SZ.min.h);

//       const maxLeft = w.width - currentWidth - MARGIN;
//       const maxTop = w.height - currentHeight - MARGIN;

//       newLeft = Math.max(MARGIN, Math.min(newLeft, maxLeft));
//       newTop = Math.max(MARGIN, Math.min(newTop, maxTop));

//       return { x: newLeft, y: newTop };
//    };

//    const handleMouseDown = (e) => {
//       console.log("down");
//       pagePostMessage("I_C_IS_DRAGGING", true, window.parent);
//       // isDragging = true;
//       // dragOffsetRef.current = {
//       //    x: newLeft,
//       //    y: newTop,
//       // };
//       e.preventDefault();
//    };

//    // const handleMouseMove = (e) => {
//    //    if (!isDragging) return;
//    //    const newPosition = calculateDragPosition(e);
//    //    console.log(newPosition);
//    //    pagePostMessage("move", newPosition, window.parent);
//    // };

//    const handleMouseUp = () => {
//       pagePostMessage("I_C_IS_DRAGGING", false, window.parent);
//    };

//    window.addEventListener("mousedown", handleMouseDown);
//    // window.addEventListener("mousemove", handleMouseMove);
//    window.addEventListener("mouseup", handleMouseUp);

// })();        
