import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuTextSelect } from "react-icons/lu";
import { RiChatVoiceAiLine } from "react-icons/ri";
import { TiArrowMoveOutline } from "react-icons/ti";
import ChatBot from "../components/ChatBot";
import extensionUtils from "./../utils/utilsModule.js";

export default function Menu() {
   const MARGIN = 0;

   const SIZES = useMemo(
      () => ({
         min: { w: "160px", h: "50px" },
         max: { w: "380px", h: "560px" },
      }),
      []
   );

   // State
   const [isChatOpen, setIsChatOpen] = useState(false);
   const [size, setSize] = useState(SIZES.min);
   const [iframePos, setIframePos] = useState({ x: MARGIN, y: MARGIN });
   const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
   const [menuOpacity, setMenuOpacity] = useState("1");
   const [isEntering, setIsEntering] = useState(false);
   const [isDragging, setIsDragging] = useState(false);
   const [isCollapse, setIsCollapse] = useState(false);
   const menuRef = useRef(null);
   const dragRef = useRef(null);
   const expandTimerRef = useRef(null);

   useEffect(() => {
      extensionUtils.pageOnMessage("C_I_OPEN_CHAT", () => {
         setIsChatOpen(true);
      });
      extensionUtils.pageOnMessage("C_I_CLOSE_CHAT", () => {
         setIsChatOpen(false);
      });

      extensionUtils.pageOnMessage("C_I_HIDDEN", () => {
         setMenuOpacity("0");
      });
      extensionUtils.pageOnMessage("C_I_VISIBLE", () => {
         setMenuOpacity("1");
      });
   }, []);

   // FIXME: Update
   // useEffect(() => {
   //    extensionUtils.pagePostMessage(
   //       "I_C_CHAT_TOGGLE",
   //       {
   //          width: size.w,
   //          height: size.h,
   //       },
   //       window.parent
   //    );
   // }, [size]);

   // Position Management
   const applyCollisionDetection = useCallback(
      (left, top) => {
         const menuRect = menuRef.current.getBoundingClientRect();
         const menuWidth = menuRect.width || size.w;
         const menuHeight = menuRect.height || size.h;

         // Get viewport dimensions
         const VW = window.innerWidth || document.documentElement.clientWidth;
         const VH = window.innerHeight || document.documentElement.clientHeight;

         // Constrain position to viewport bounds
         const constrainedLeft = Math.max(0, Math.min(left, VW - menuWidth));
         const constrainedTop = Math.max(0, Math.min(top, VH - menuHeight));

         return { x: constrainedLeft, y: constrainedTop };
      },
      [size]
   );

   // const ensureVisibleOnScreen = useCallback(() => {
   //    if (!menuRef.current) return;

   //    const rect = menuRef.current.getBoundingClientRect();
   //    const maxWidth = parseInt(SIZES.max.w);
   //    const maxHeight = parseInt(SIZES.max.h);

   //    const newPosition = calculateOnScreenPosition(
   //       rect,
   //       position,
   //       maxWidth,
   //       maxHeight
   //    );
   //    const needsRepositioning =
   //       newPosition.x !== position.x || newPosition.y !== position.y;

   //    if (needsRepositioning) {
   //       if (!originalPosition) {
   //          setOriginalPosition({ x: position.x, y: position.y });
   //       }
   //       // animateRepositioning(newPosition);
   //    }
   // }, [
   //    SIZES.max.w,
   //    SIZES.max.h,
   //    position,
   //    originalPosition,
   //    calculateOnScreenPosition,
   //    // animateRepositioning,
   // ]);

   // FIXME:
   useEffect(() => {
      setSize(isChatOpen ? SIZES.max : SIZES.min);

      // if (isChatOpen) {
      //    ensureVisibleOnScreen();
      // }
   }, [isChatOpen, SIZES]);

   useEffect(() => {
      const menuEle = menuRef.current;
      const dragEle = dragRef.current;
      if (!menuEle || !dragEle) return;

      const expandIframeToViewport = () => {
         clearTimeout(expandTimerRef.current);
         setMenuOpacity("0");
         extensionUtils.pagePostMessage("I_C_RESIZE_IFRAME", {
            width: "100svw",
            height: "100svh",
            x: "0px",
            y: "0px",
         }, window.parent);
         menuEle.style.left = `${iframePos.x}px`;
         menuEle.style.top = `${iframePos.y}px`;
         setTimeout(() => {
            setMenuOpacity("1");
         }, 20);
      };

      const shrinkIframeToBox = () => {
         clearTimeout(expandTimerRef.current);

         expandTimerRef.current = setTimeout(() => {
            setMenuOpacity("0");
            const left = Number.parseFloat(menuEle.style.left) || 0;
            const top = Number.parseFloat(menuEle.style.top) || 0;
            setIframePos({ x: Math.round(left), y: Math.round(top) });

            extensionUtils.pagePostMessage("I_C_RESIZE_IFRAME", {
               width: size.w,
               height: size.h,
               x: `${iframePos.x}px`,
               y: `${iframePos.y}px`,
            }, window.parent);
            menuEle.style.left = "0px";
            menuEle.style.top = "0px";
            setTimeout(() => {
               setMenuOpacity("1");
            }, 20);
         }, 300);
      };

      const pointerEnter = () => {
         if (isEntering) return;
         setIsEntering(true);
         expandIframeToViewport();
      };

      const pointerLeave = () => {
         if (!isEntering || isDragging) return;
         setIsEntering(false);
         shrinkIframeToBox();
      };

      const pointerDown = (e) => {
         if (!isEntering) {
            setIsEntering(true);
            expandIframeToViewport();
         }
         setIsDragging(true);
         const rect = menuEle.getBoundingClientRect();
         setPointerOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
         });
         if (menuEle.setPointerCapture) menuEle.setPointerCapture(e.pointerId);
      };

      const pointerMove = (e) => {
         if (!isDragging) return;
         const newLeft = e.clientX - pointerOffset.x;
         const newTop = e.clientY - pointerOffset.y;

         // Apply collision detection to keep menu within viewport
         const constrainedPosition = applyCollisionDetection(newLeft, newTop);

         menuEle.style.left = `${constrainedPosition.x}px`;
         menuEle.style.top = `${constrainedPosition.y}px`;
      };

      const pointerUp = (e) => {
         if (!isDragging) return;
         setIsDragging(false);
         setIsEntering(false);
         setIsCollapse(true);
         if (menuEle.releasePointerCapture)
            menuEle.releasePointerCapture(e.pointerId);

         const left = Number.parseFloat(menuEle.style.left) || 0;
         const top = Number.parseFloat(menuEle.style.top) || 0;

         const constrainedPosition = applyCollisionDetection(left, top);
         menuEle.style.left = `${constrainedPosition.x}px`;
         menuEle.style.top = `${constrainedPosition.y}px`;

         setIframePos({
            x: Math.round(constrainedPosition.x),
            y: Math.round(constrainedPosition.y),
         });
      };

      const pointerLeaveAfter = () => {
         if (!isCollapse) return;
         setIsCollapse(false);
         shrinkIframeToBox();
      };

      menuEle.addEventListener("pointerenter", pointerEnter);
      menuEle.addEventListener("pointerleave", pointerLeave);
      dragEle.addEventListener("pointerdown", pointerDown);
      // menuEle.addEventListener("pointerdown", pointerDown);
      window.addEventListener("pointermove", pointerMove);
      menuEle.addEventListener("pointerup", pointerUp);
      menuEle.addEventListener("pointerleave", pointerLeaveAfter);

      return () => {
         menuEle.removeEventListener("pointerenter", pointerEnter);
         menuEle.removeEventListener("pointerleave", pointerLeave);
         dragEle.removeEventListener("pointerdown", pointerDown);
         // menuEle.removeEventListener("pointerdown", pointerDown);
         window.removeEventListener("pointermove", pointerMove);
         menuEle.removeEventListener("pointerup", pointerUp);
         menuEle.removeEventListener("pointerleave", pointerLeaveAfter);
      };
   }, [
      pointerOffset,
      isDragging,
      isEntering,
      isCollapse,
      size,
      iframePos,
      applyCollisionDetection,
   ]);

   // Activity Monitoring
   // useEffect(() => {
   //    resetInactivityTimer();

   //    const handleUserActivity = () => {
   //       resetInactivityTimer();
   //    };

   //    document.addEventListener("mousemove", handleUserActivity);
   //    document.addEventListener("mousedown", handleUserActivity);
   //    document.addEventListener("keydown", handleUserActivity);
   //    document.addEventListener("touchstart", handleUserActivity);
   //    return () => {
   //       if (inactivityTimerRef.current) {
   //          clearTimeout(inactivityTimerRef.current);
   //       }

   //       document.removeEventListener("mousemove", handleUserActivity);
   //       document.removeEventListener("mousedown", handleUserActivity);
   //       document.removeEventListener("keydown", handleUserActivity);
   //       document.removeEventListener("touchstart", handleUserActivity);
   //    };
   // }, [resetInactivityTimer]);

   // Chat Management
   // const handleCloseChat = useCallback(() => {
   //    setIsChatOpen(false);

   //    if (originalPosition) {
   //       setIsRepositioning(true);
   //       requestAnimationFrame(() => {
   //          requestAnimationFrame(() => {
   //             setPosition(originalPosition);
   //             setTimeout(() => {
   //                setIsRepositioning(false);
   //                setOriginalPosition(null);
   //             }, ANIMATION_DURATION);
   //          });
   //       });
   //    }
   // }, [originalPosition, ANIMATION_DURATION]);

   const toggleChat = useCallback(() => {
      if (!isChatOpen) {
         setIsChatOpen(true);
         // requestAnimationFrame(() => {
         //    requestAnimationFrame(() => {
         //       ensureVisibleOnScreen();
         //    });
         // });
      } else {
         // handleCloseChat();
      }
   }, [isChatOpen, /*ensureVisibleOnScreen, handleCloseChat*/]);

   // const handleSelectText = useCallback(() => {
   //    extensionUtils.pagePostMessage("I_C_SELECT_TEXT", {}, window.parent);
   // }, []);

   // Render UI
   return (
      <div
         className="absolute"
         ref={menuRef}
         style={{
            zIndex: 9999,
            opacity: menuOpacity,
         }}
         // onMouseEnter={() => setIsTransparent(false)}
         // onMouseLeave={() => !isDragging && resetInactivityTimer()}
      >
         <main
            className={`relative left-[1px] top-[1px] grid bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600 rounded-md shadow-md outline-1 outline-white dark:outline-blue-500 overflow-hidden transition-all duration-300 ease-in-out`}
            style={{
               width: `calc(${size.w} - 2px)`,
               height: `calc(${size.h} - 2px)`,
               gridTemplateRows: "auto 1fr",
            }}
         >
            <section
               className="relative flex items-center justify-center"
               style={{
                  height: `calc(${SIZES.min.h} - 2px)`,
                  width: isChatOpen
                     ? `calc(${SIZES.max.w} - 2px)`
                     : `calc(${SIZES.min.w} - 2px)`,
               }}
            >
               <div
                  className="relative h-full w-full flex gap-[4px] items-center"
                  id="header"
               >
                  <div
                     ref={dragRef}
                     className={`relative grid place-items-center rounded-lg text-2xl cursor-move ${
                        isDragging
                           ? "bg-gray-50/90 text-gray-950"
                           : "bg-gray-950/20 text-gray-50 hover:bg-gray-50/90  hover:text-gray-950"
                     } transition-all duration-200`}
                     style={{
                        height: `calc(${SIZES.min.h} - 4px)`,
                        width: `calc(${SIZES.min.h} - 4px)`,
                     }}
                  >
                     <TiArrowMoveOutline />
                  </div>

                  <div
                     onClick={toggleChat}
                     className={`relative grid place-items-center rounded-lg text-2xl cursor-pointer transition-all duration-200 ${
                        isChatOpen
                           ? "bg-blue-500 text-white hover:bg-blue-600"
                           : "bg-gray-950/20 text-gray-50 hover:bg-gray-950/40 hover:text-gray-300"
                     }`}
                     style={{
                        height: `calc(${SIZES.min.h} - 4px)`,
                        width: `calc(${SIZES.min.h} - 4px)`,
                     }}
                  >
                     <RiChatVoiceAiLine />
                  </div>

                  <div
                     className="relative grid place-items-center bg-gray-950/20 rounded-lg text-2xl cursor-pointer hover:bg-gray-950/40 text-gray-50 hover:text-gray-300 transition-all duration-200"
                     // onClick={handleSelectText}
                     style={{
                        height: `calc(${SIZES.min.h} - 4px)`,
                        width: `calc(${SIZES.min.h} - 4px)`,
                     }}
                  >
                     <LuTextSelect />
                  </div>

                  {isChatOpen && (
                     <div className="absolute right-[1px] top-[1px] p-1">
                        <div
                           // onClick={handleCloseChat}
                           className="relative aspect-[7/6] grid place-items-center bg-red-500 rounded-lg text-3xl cursor-pointer hover:bg-red-700 text-white transition-all duration-200"
                           title="Close chat"
                           style={{
                              height: `calc(${SIZES.min.h} - 4px)`,
                              width: `calc(${SIZES.min.h} - 4px)`,
                           }}
                        >
                           <IoClose />
                        </div>
                     </div>
                  )}
               </div>
            </section>

            <div
               className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                  isChatOpen ? "opacity-100" : "opacity-0 max-h-0"
               }`}
               style={{
                  maxHeight: isChatOpen
                     ? `calc(${SIZES.max.h} - ${SIZES.min.h} - 4px)`
                     : "0",
               }}                          
            >
               <div className="h-full">
                  <ChatBot isOpen={isChatOpen} />
               </div>
            </div>
         </main>
      </div>
   );
}
