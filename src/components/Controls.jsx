import { useCallback, useEffect, useRef, useState } from "react";
import { RxDragHandleDots2 } from "react-icons/rx";
import extensionUtils from "./../utils/utilsModule.js";

const AI_OPTIONS = [
   {
      id: "google",
      name: "Google AI",
      enabled: true,
      gradient: "from-red-500 to-yellow-500",
   },
   {
      id: "perplexity",
      name: "Perplexity",
      enabled: true,
      gradient: "from-emerald-500 to-cyan-500",
   },
   {
      id: "bing",
      name: "Bing AI",
      enabled: true,
      gradient: "from-cyan-500 to-blue-600",
   },
   {
      id: "gemini",
      name: "Gemini",
      enabled: true,
      gradient: "from-violet-600 to-blue-500",
   },
   {
      id: "grok",
      name: "Grok AI",
      enabled: false,
      gradient: "from-pink-500 to-purple-600",
   },
];

const getConcurrentRequestOptions = (enabledCount) => [
   {
      value: 1,
      icon: "sbi-flash1",
      color: "text-yellow-500",
      label: "Fast",
      description: "Fastest response, single AI",
   },
   {
      value: 2,
      icon: "sbi-balance-scale",
      color: "text-blue-500",
      label: "Balanced",
      description: "Balanced speed & quality",
   },
   {
      value: 3,
      icon: "sbi-target",
      color: "text-green-500",
      label: "Quality",
      description: "Good results, moderate speed",
   },
   {
      value: enabledCount,
      icon: "sbi-rocket",
      color: "text-red-500",
      label: "All",
      description: `Use all ${enabledCount} enabled AIs`,
   },
];

export default function Controls() {
   const [aiList, setAiList] = useState(AI_OPTIONS);
   const [draggedItem, setDraggedItem] = useState(null);
   const [dragOverIndex, setDragOverIndex] = useState(null);
   const [mainToggleEnabled, setMainToggleEnabled] = useState(false);
   const [concurrentRequests, setConcurrentRequests] = useState(2);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [isInitialized, setIsInitialized] = useState(false);
   const dropdownRef = useRef(null);

   const enabledCount = aiList.filter((ai) => ai.enabled).length;
   const concurrentOptions = getConcurrentRequestOptions(enabledCount);

   // Adjust concurrent requests if it exceeds available options
   useEffect(() => {
      const validValues = concurrentOptions.map((opt) => opt.value);
      if (!validValues.includes(concurrentRequests)) {
         setConcurrentRequests(Math.min(concurrentRequests, enabledCount));
      }
   }, [enabledCount, concurrentRequests, concurrentOptions]);

   const saveSettings = useCallback(() => {
      if (!isInitialized) return;

      const controlsData = {
         aiProviders: aiList,
         concurrentRequests: concurrentRequests,
      };

      extensionUtils.chromeStorageSetLocal(
         extensionUtils.KEYS.CONTROLS,
         controlsData
      );
   }, [aiList, concurrentRequests, isInitialized]);

   useEffect(() => {
      saveSettings();
   }, [saveSettings]);

   useEffect(() => {
      const loadControlsData = () => {
         setIsLoading(true);

         extensionUtils.chromeStorageGetLocal(
            extensionUtils.KEYS.CONTROLS,
            (controlsData) => {
               if (!controlsData) {
                  setIsLoading(false);
                  setIsInitialized(true);
                  return;
               }

               if (
                  controlsData.aiProviders &&
                  Array.isArray(controlsData.aiProviders)
               ) {
                  setAiList(controlsData.aiProviders);
               }

               if (
                  controlsData.concurrentRequests &&
                  typeof controlsData.concurrentRequests === "number"
               ) {
                  setConcurrentRequests(controlsData.concurrentRequests);
               }

               setIsLoading(false);
               setIsInitialized(true);
            }
         );
      };

      loadControlsData();
   }, []);

   useEffect(() => {
      const checkMainToggle = async () => {
         const settings = await extensionUtils.chromeStorageGetLocal(
            extensionUtils.KEYS.SETTINGS
         );
         setMainToggleEnabled(settings.enable);
      };

      checkMainToggle();

      const interval = setInterval(checkMainToggle, 100);
      return () => clearInterval(interval);
   }, []);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
         ) {
            setDropdownOpen(false);
         }
      };

      if (dropdownOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [dropdownOpen]);

   const sortAiList = (list) => {
      const enabled = list.filter((ai) => ai.enabled);
      const disabled = list.filter((ai) => !ai.enabled);
      return [...enabled, ...disabled];
   };

   const handleToggle = useCallback(
      (id) => {
         if (!mainToggleEnabled) return;

         setAiList((prev) => {
            const updated = prev.map((ai) => {
               if (ai.id === id) {
                  if (ai.enabled && enabledCount <= 1) {
                     return ai;
                  }
                  return { ...ai, enabled: !ai.enabled };
               }
               return ai;
            });

            setTimeout(() => {
               setAiList(sortAiList(updated));
            }, 300);

            return updated;
         });
      },
      [enabledCount, mainToggleEnabled]
   );

   const handleDragStart = (e, index) => {
      if (!mainToggleEnabled) return;
      setDraggedItem(index);
      e.dataTransfer.effectAllowed = "move";
   };

   const handleDragOver = (e, index) => {
      if (!mainToggleEnabled) return;
      e.preventDefault();
      const draggedAI = aiList[draggedItem];
      const targetAI = aiList[index];

      if (draggedAI?.enabled && targetAI?.enabled) {
         setDragOverIndex(index);
      }
   };

   const handleDragLeave = () => {
      if (!mainToggleEnabled) return;
      setDragOverIndex(null);
   };

   const handleDrop = (e, dropIndex) => {
      if (!mainToggleEnabled) return;
      e.preventDefault();

      if (draggedItem === null || draggedItem === dropIndex) {
         setDraggedItem(null);
         setDragOverIndex(null);
         return;
      }

      const draggedAI = aiList[draggedItem];
      const targetAI = aiList[dropIndex];

      if (!draggedAI?.enabled || !targetAI?.enabled) {
         setDraggedItem(null);
         setDragOverIndex(null);
         return;
      }

      const newList = [...aiList];
      const draggedItem_copy = newList[draggedItem];

      newList.splice(draggedItem, 1);
      newList.splice(dropIndex, 0, draggedItem_copy);

      setAiList(sortAiList(newList));
      setDraggedItem(null);
      setDragOverIndex(null);
   };

   if (isLoading) {
      return (
         <div className="relative w-full h-auto p-2 flex flex-col justify-center items-center">
            <div className="text-center">
               <div className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  🔄 Loading Settings...
               </div>
               <div className="text-xs text-gray-600 dark:text-gray-400">
                  Please wait while we load your configuration
               </div>
            </div>
         </div>
      );
   }

   return (
      <div
         className={`relative w-full h-auto p-2 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
            mainToggleEnabled
               ? "opacity-100 transform translate-y-0"
               : "opacity-50 transform translate-y-1 pointer-events-none"
         }`}
      >
         {/* Concurrent Requests Section */}
         <div
            className={`relative w-full flex flex-col gap-1 transition-all duration-700 ease-in-out ${
               mainToggleEnabled
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-30 transform translate-y-2 pointer-events-none"
            }`}
         >
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-50 flex gap-2 items-center">
               <i className="sbi-speed text-lg text-[#00b0d8]" />
               <p>Request Settings</p>
               {!mainToggleEnabled && (
                  <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                     Disabled
                  </span>
               )}
            </div>
            <p className="text-xs mb-3 text-gray-600 dark:text-gray-400">
               {mainToggleEnabled
                  ? "Choose how many AI providers to query simultaneously"
                  : "Enable Smart Assistant to configure request settings"}
            </p>

            <div className="relative" ref={dropdownRef}>
               <button
                  className={`w-full flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 ${
                     mainToggleEnabled ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                  onClick={() =>
                     mainToggleEnabled && setDropdownOpen(!dropdownOpen)
                  }
                  disabled={!mainToggleEnabled}
               >
                  <div className="relative w-full flex items-center justify-between">
                     <span className="font-medium text-gray-900 dark:text-gray-50">
                        {concurrentRequests} Request
                        {concurrentRequests > 1 ? "s" : ""} Simultaneously
                     </span>
                     <span className="text-xs mr-1 text-gray-600 dark:text-gray-400 flex gap-2 items-center">
                        {(() => {
                           const option = concurrentOptions.find(
                              (opt) => opt.value === concurrentRequests
                           );
                           return option ? (
                              <>
                                 <i
                                    className={`${option.icon} ${option.color}`}
                                 />{" "}
                                 {option.label}
                              </>
                           ) : null;
                        })()}
                     </span>
                  </div>
                  <svg
                     className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? "transform rotate-180" : ""
                     }`}
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                     />
                  </svg>
               </button>

               {dropdownOpen && mainToggleEnabled && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                     {concurrentOptions.map((option) => (
                        <button
                           key={option.value}
                           className={`w-full flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                              concurrentRequests === option.value
                                 ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                 : "text-gray-900 dark:text-gray-50"
                           }`}
                           onClick={() => {
                              setConcurrentRequests(option.value);
                              setDropdownOpen(false);
                           }}
                        >
                           <div className="flex flex-col items-start">
                              <span className="font-medium">
                                 {option.value} Request
                                 {option.value > 1 ? "s" : ""}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                 {option.description}
                              </span>
                           </div>
                           <span className="text-xs font-medium flex gap-2 items-center">
                              <i className={`${option.icon} ${option.color}`} />
                              <p>{option.label}</p>
                           </span>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>

         <br />

         {/* AI Providers Section */}
         <div
            className={`relative w-full flex flex-col gap-1 transition-all duration-700 ease-in-out delay-100 ${
               mainToggleEnabled
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-30 transform translate-y-2 pointer-events-none"
            }`}
         >
            <div className="m-0">
               <div className="text-lg font-semibold text-gray-900 dark:text-gray-50 flex gap-2 items-center">
                  <i className="sbi-probot pb-1" />
                  <p>AI Providers</p>
                  {!mainToggleEnabled && (
                     <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        Disabled
                     </span>
                  )}
               </div>
            </div>

            <p className="text-xs mb-2 text-gray-600 dark:text-gray-400">
               {mainToggleEnabled
                  ? "Drag enabled AIs to reorder priority • At least one enabled"
                  : "Enable AI Display to configure providers"}
            </p>
            <div className="space-y-2">
               {aiList.map((ai, index) => {
                  const isEnabled = ai.enabled;
                  const canDrag = isEnabled;
                  const isLastRequired = isEnabled && enabledCount <= 1;
                  const enabledIndex = aiList.filter(
                     (item, i) => item.enabled && i < index
                  ).length;

                  return (
                     <div
                        key={ai.id}
                        draggable={canDrag}
                        onDragStart={
                           canDrag
                              ? (e) => handleDragStart(e, index)
                              : undefined
                        }
                        onDragOver={
                           canDrag ? (e) => handleDragOver(e, index) : undefined
                        }
                        onDragLeave={canDrag ? handleDragLeave : undefined}
                        onDrop={
                           canDrag ? (e) => handleDrop(e, index) : undefined
                        }
                        className={`relative flex items-center justify-between p-3 rounded-lg border transition-all duration-300 transform ${
                           isEnabled
                              ? `bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 scale-100 ${
                                   dragOverIndex === index
                                      ? "border-blue-400 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/50"
                                      : "hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                } ${canDrag ? "cursor-move" : "cursor-default"}`
                              : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 scale-95 opacity-75"
                        }`}
                     >
                        <div className="flex items-center space-x-3 flex-1">
                           <label
                              htmlFor={ai.id}
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                           >
                              <input
                                 type="checkbox"
                                 id={ai.id}
                                 checked={isEnabled}
                                 onChange={() => handleToggle(ai.id)}
                                 disabled={isLastRequired}
                                 className={`${
                                    isLastRequired
                                       ? "opacity-50 cursor-not-allowed"
                                       : ""
                                 }`}
                                 style={{
                                    "--switch-color-off": "#64748b",
                                    "--switch-color-on": "#3b82f6",
                                 }}
                              />
                              <span
                                 className={`text-sm font-bold bg-gradient-to-r ${ai.gradient} inline-block text-transparent bg-clip-text`}
                              >
                                 {ai.name}
                              </span>
                           </label>
                        </div>

                        <div className="flex items-center space-x-3">
                           {isEnabled && (
                              <div className="flex items-center space-x-2">
                                 <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {enabledIndex === 0
                                       ? "Primary"
                                       : enabledIndex === 1
                                       ? "Secondary"
                                       : `#${enabledIndex + 1}`}
                                 </span>
                                 {isLastRequired && enabledIndex === 0 && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                       Required
                                    </span>
                                 )}
                              </div>
                           )}
                           <RxDragHandleDots2
                              className={`text-gray-500 dark:text-gray-400 text-lg transition-all duration-300 transform ${
                                 isEnabled
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-75"
                              }`}
                              size={30}
                           />
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
}
