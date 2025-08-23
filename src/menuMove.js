// /* 
               
//                // Constants
//                   const MARGIN = 5;
//                   const INACTIVITY_TIMEOUT = 30000;
//                   const ANIMATION_DURATION = 400;
               
//                   const SIZES = useMemo(
//                      () => ({
//                         min: { w: "160px", h: "50px" },
//                         max: { w: "380px", h: "560px" },
//                      }),
//                      []
//                   );
               
//                   // State
//                   const [isChatOpen, setIsChatOpen] = useState(false);
//                   const [size, setSize] = useState(SIZES.min);
//                   const [isTransparent, setIsTransparent] = useState(false);
//                   const [position, setPosition] = useState({ x: MARGIN, y: 100 });
//                   const [originalPosition, setOriginalPosition] = useState(null);
//                   const [isRepositioning, setIsRepositioning] = useState(false);
//                   const [isHidden, setIsHidden] = useState(false);
//                   const [isDragging, setIsDragging] = useState(false);
               
//                   // Refs
//                   const mainRef = useRef(null);
//                   const moveElementRef = useRef(null);
//                   const isDraggingRef = useRef(false);
//                   const dragOffsetRef = useRef({ x: 0, y: 0 });
//                   const inactivityTimerRef = useRef(null);
               
               
//                   const animateRepositioning = useCallback(
//                      (newPosition) => {
//                         setIsRepositioning(true);
//                         requestAnimationFrame(() => {
//                            requestAnimationFrame(() => {
//                               setPosition(newPosition);
//                               setTimeout(() => {
//                                  setIsRepositioning(false);
//                               }, ANIMATION_DURATION);
//                            });
//                         });
//                      },
//                      [ANIMATION_DURATION]
//                   );
               
//                   const ensureVisibleOnScreen = useCallback(() => {
//                      if (!mainRef.current) return;
               
//                      const rect = mainRef.current.getBoundingClientRect();
//                      const maxWidth = parseInt(SIZES.max.w);
//                      const maxHeight = parseInt(SIZES.max.h);
               
//                      const newPosition = calculateOnScreenPosition(
//                         rect,
//                         position,
//                         maxWidth,
//                         maxHeight
//                      );
//                      const needsRepositioning =
//                         newPosition.x !== position.x || newPosition.y !== position.y;
               
//                      if (needsRepositioning) {
//                         if (!originalPosition) {
//                            setOriginalPosition({ x: position.x, y: position.y });
//                         }
//                         animateRepositioning(newPosition);
//                      }
//                   }, [
//                      SIZES.max.w,
//                      SIZES.max.h,
//                      position,
//                      originalPosition,
//                      calculateOnScreenPosition,
//                      animateRepositioning,
//                   ]);
               
//                   useEffect(() => {
//                      setSize(isChatOpen ? SIZES.max : SIZES.min);
               
//                      if (isChatOpen) {
//                         ensureVisibleOnScreen();
//                      }
//                   }, [isChatOpen, SIZES, ensureVisibleOnScreen]);
               
//                   // Inactivity Management
//                   const resetInactivityTimer = useCallback(() => {
//                      if (inactivityTimerRef.current) {
//                         clearTimeout(inactivityTimerRef.current);
//                      }
//                      setIsTransparent(false);
//                      inactivityTimerRef.current = setTimeout(() => {
//                         setIsTransparent(true);
//                         setIsChatOpen(false);
//                      }, INACTIVITY_TIMEOUT);
//                   }, [INACTIVITY_TIMEOUT]);
               
//                   // Drag Handling
//                   const calculateDragPosition = useCallback(
//                      (e) => {
//                         let newLeft = e.clientX - dragOffsetRef.current.x;
//                         let newTop = e.clientY - dragOffsetRef.current.y;
               
//                         const currentWidth = parseInt(isChatOpen ? SIZES.max.w : SIZES.min.w);
//                         const currentHeight = parseInt(isChatOpen ? SIZES.max.h : SIZES.min.h);
               
//                         const maxLeft = window.innerWidth - currentWidth - MARGIN;
//                         const maxTop = window.innerHeight - currentHeight - MARGIN;
               
//                         newLeft = Math.max(MARGIN, Math.min(newLeft, maxLeft));
//                         newTop = Math.max(MARGIN, Math.min(newTop, maxTop));
               
//                         return { x: newLeft, y: newTop };
//                      },
//                      [isChatOpen, SIZES]
//                   );
               
//                   useEffect(() => {
//                      const moveElement = moveElementRef.current;
//                      if (!moveElement) return;
               
//                      const handleMouseDown = (e) => {
//                         isDraggingRef.current = true;
//                         setIsDragging(true);
//                         const rect = moveElement.getBoundingClientRect();
//                         dragOffsetRef.current = {
//                            x: e.clientX - rect.left,
//                            y: e.clientY - rect.top,
//                         };
//                         e.preventDefault();
//                      };
               
//                      const handleMouseMove = (e) => {
//                         if (!isDraggingRef.current) return;
//                         resetInactivityTimer();
//                         const newPosition = calculateDragPosition(e);
//                         setPosition(newPosition);
//                      };
               
//                      const handleMouseUp = () => {
//                         isDraggingRef.current = false;
//                         setIsDragging(false);
//                         resetInactivityTimer();
//                      };
               
//                      moveElement.addEventListener("mousedown", handleMouseDown);
//                      document.addEventListener("mousemove", handleMouseMove);
//                      document.addEventListener("mouseup", handleMouseUp);
//                      return () => {
//                         moveElement.removeEventListener("mousedown", handleMouseDown);
//                         document.removeEventListener("mousemove", handleMouseMove);
//                         document.removeEventListener("mouseup", handleMouseUp);
               
//                         if (inactivityTimerRef.current) {
//                            clearTimeout(inactivityTimerRef.current);
//                         }
//                      };
//                   }, [isChatOpen, SIZES, resetInactivityTimer, calculateDragPosition]);
               
//                   // Activity Monitoring
//                   useEffect(() => {
//                      resetInactivityTimer();
               
//                      const handleUserActivity = () => {
//                         resetInactivityTimer();
//                      };
               
//                      document.addEventListener("mousemove", handleUserActivity);
//                      document.addEventListener("mousedown", handleUserActivity);
//                      document.addEventListener("keydown", handleUserActivity);
//                      document.addEventListener("touchstart", handleUserActivity);
//                      return () => {
//                         if (inactivityTimerRef.current) {
//                            clearTimeout(inactivityTimerRef.current);
//                         }
               
//                         document.removeEventListener("mousemove", handleUserActivity);
//                         document.removeEventListener("mousedown", handleUserActivity);
//                         document.removeEventListener("keydown", handleUserActivity);
//                         document.removeEventListener("touchstart", handleUserActivity);
//                      };
//                   }, [resetInactivityTimer]);
               
//                */



// (async () => {
//    const MARGIN = 5;
//    const INACTIVITY_TIMEOUT = 30000;
//    const ANIMATION_DURATION = 400;


//    const SZ = {
//       min: { w: "160px", h: "50px" },
//       max: { w: "380px", h: "560px" },
//    };
//    let isDragging = false;
//    let dragOffsetRef = {
//       current: { x: 0, y: 0 },
//    };

//    window.style = `
//       position: fixed;
//       width: ${SZ.min.w};
//       height: ${SZ.min.h};
//       inset: 0;
//       border: none;
//       background: transparent !important;
//       z-index: 8250032643;
//       pointer-events: auto;
//       isolation: isolate;
//    `;

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
//       let newLeft = e.clientX - dragOffsetRef.current.x;
//       let newTop = e.clientY - dragOffsetRef.current.y;

//       const currentWidth = parseInt(SZ.min.w);
//       const currentHeight = parseInt(SZ.min.h);

//       const maxLeft = window.innerWidth - currentWidth - MARGIN;
//       const maxTop = window.innerHeight - currentHeight - MARGIN;

//       newLeft = Math.max(MARGIN, Math.min(newLeft, maxLeft));
//       newTop = Math.max(MARGIN, Math.min(newTop, maxTop));

//       console.log(newLeft, newTop);

//       return { x: newLeft, y: newTop };
//    };

//    const handleMouseDown = (e) => {
//       console.log("down");
//       isDragging = true;
//       dragOffsetRef.current = {
//          x: e.clientX - window.offsetLeft,
//          y: e.clientY - window.offsetTop,
//       };
//       e.preventDefault();
//    };

//    const handleMouseMove = (e) => {
//       if (!isDragging) return;
//       const newPosition = calculateDragPosition(e);
//       console.log(newPosition);
//       window.style.left = `${newPosition.x}px`;
//       window.style.top = `${newPosition.y}px`;
//    };

//    const handleMouseUp = () => {
//       isDragging = false;
//    };

//    window.addEventListener("mousedown", handleMouseDown);
//    window.parent.addEventListener("mousemove", handleMouseMove);
//    window.parent.addEventListener("mouseup", handleMouseUp);

// })();        
