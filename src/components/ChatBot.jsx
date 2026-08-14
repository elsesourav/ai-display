import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  IoClose,
  IoSend,
  IoTimeOutline,
  IoTrashOutline,
} from "react-icons/io5";
import UTILS from "./../utils/utilsModule.js";

export default function ChatBot({ isOpen }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [answers, setAnswers] = useState({});
  const [selectedProvider, setSelectedProvider] = useState("google");
  const currentRequestIdRef = useRef(null);
  const lastQuestionRef = useRef("");

  const [aiProviders, setAiProviders] = useState([]);

  // Maximum concurrent requests
  const [maxConcurrentRequest, setMaxConcurrentRequest] = useState(2);

  // History state
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const scrollContainerRef = useRef(null);
  const rootRef = useRef(null);
  const textareaRef = useRef(null);
  const providerListRef = useRef(null);

  // Map vertical wheel to horizontal scroll for providers
  useEffect(() => {
    const el = providerListRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY + e.deltaX; // accommodate trackpads too
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Clear input function
  const clearInput = useCallback(() => {
    setInput("");
  }, []);

  useEffect(() => {
    UTILS.pageOnMessage("IF_C_GET_CURRENT_CONTROLS", (data) => {
      const { aiProviders, concurrentRequests } = data?.controls || {};
      const enabledProviders = (aiProviders || []).filter((p) => p.enabled);
      setAiProviders(enabledProviders);
      setMaxConcurrentRequest(concurrentRequests);
    });

    // Load History
    UTILS.chromeStorageGetLocal(UTILS.KEYS.HISTORY, (data) => {
      if (data && Array.isArray(data)) {
        setHistory(data);
      }
    });
  }, []);

  // Helper to save history to storage
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    UTILS.chromeStorageSetLocal(UTILS.KEYS.HISTORY, newHistory);
  };

  // get answer from background script
  const getAnswerFromBackground = async (
    question,
    provider = "google",
    requestId,
  ) => {
    UTILS.pagePostMessage(
      "IF_B_GET_ANSWER",
      { question, provider, requestId },
      window.parent,
    );
  };

  // Concurrent provider loading - maintains constant number of active requests
  const loadProvidersWithConcurrency = useCallback(
    async (question, requestId) => {
      const providersToProcess = [...aiProviders];
      const activeRequests = new Map();
      let completedCount = 0;

      console.log(
        `Starting concurrent loading with max ${maxConcurrentRequest} simultaneous requests`,
      );

      const startProviderRequest = (provider) => {
        // console.log(`Starting request for ${provider.id}`);

        getAnswerFromBackground(question, provider.id, requestId);

        const promise = new Promise((resolve) => {
          const checkAnswer = () => {
            if (currentRequestIdRef.current !== requestId) {
              resolve({ cancelled: true });
              return;
            }

            setAnswers((current) => {
              if (current[provider.id]) {
                console.log(`${provider.id} completed`);
                resolve({ provider, completed: true });
              } else {
                setTimeout(checkAnswer, 500);
              }
              return current;
            });
          };
          checkAnswer();
        });

        activeRequests.set(provider.id, promise);
        return promise;
      };

      const initialRequests = providersToProcess.splice(
        0,
        maxConcurrentRequest,
      );
      initialRequests.forEach((provider) => startProviderRequest(provider));

      while (activeRequests.size > 0) {
        if (currentRequestIdRef.current !== requestId) {
          console.log("Request cancelled, stopping concurrent loading");
          return;
        }
        const completedRequest = await Promise.race(activeRequests.values());

        if (completedRequest.cancelled) {
          return;
        }

        if (completedRequest.completed) {
          completedCount++;
          const providerId = completedRequest.provider.id;

          activeRequests.delete(providerId);

          if (providersToProcess.length > 0) {
            const nextProvider = providersToProcess.shift();
            startProviderRequest(nextProvider);
          }
        }
      }

      console.log(`All ${completedCount} providers completed`);
    },
    [aiProviders, maxConcurrentRequest],
  );

  // Combine currently active providers with any providers present in the loaded answers
  const displayedProviders = useMemo(() => {
    const combined = [...aiProviders];
    const existingIds = new Set(aiProviders.map(p => p.id));
    
    // Add any providers from answers that aren't in the active list (for old chat history)
    Object.keys(answers).forEach(providerId => {
       if (!existingIds.has(providerId)) {
          combined.push({
             id: providerId,
             // Capitalize the first letter as a fallback name
             name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
             enabled: false // but we show it anyway because it has historical answers
          });
       }
    });
    return combined;
  }, [aiProviders, answers]);

  const handleSendMessage = useCallback(
    async (messageInput = null) => {
      const actualInput = messageInput !== null ? messageInput : input;

      if (actualInput?.trim() === "") return;

      // Generate unique request ID
      const requestId = Date.now().toString();
      currentRequestIdRef.current = requestId;

      setLastQuestion(actualInput);
      lastQuestionRef.current = actualInput;
      setInput("");

      setIsLoading(true);
      setAnswers({});

      // Start concurrent loading
      loadProvidersWithConcurrency(actualInput, requestId);
    },
    [input, loadProvidersWithConcurrency],
  );

  useEffect(() => {
    UTILS.pageOnMessage("IF_B_GET_ANSWER", (data) => {
      // Ignore responses from old requests
      if (data.requestId && data.requestId !== currentRequestIdRef.current) {
        return;
      }

      const provider = data.provider || "google";

      setAnswers((prev) => {
        const isFirstAnswer = Object.keys(prev).length === 0;

        if (isFirstAnswer) {
          setSelectedProvider(provider);
          setIsLoading(false);
        }

        const newAnswers = {
          ...prev,
          [provider]: {
            content: data.answer,
            provider: provider,
          },
        };

        // Incrementally save/update history entry in real time
        setHistory((prevHistory) => {
          const reqId = data.requestId || currentRequestIdRef.current;
          const existingIndex = prevHistory.findIndex(
            (item) => item.id === reqId
          );

          let updatedHistory;
          if (existingIndex >= 0) {
            updatedHistory = [...prevHistory];
            updatedHistory[existingIndex] = {
              ...updatedHistory[existingIndex],
              answers: newAnswers,
            };
          } else {
            const newEntry = {
              id: reqId,
              question: lastQuestionRef.current || "",
              answers: newAnswers,
              timestamp: Date.now(),
            };
            updatedHistory = [newEntry, ...prevHistory].slice(0, 20);
          }
          UTILS.chromeStorageSetLocal(UTILS.KEYS.HISTORY, updatedHistory);
          return updatedHistory;
        });

        return newAnswers;
      });
    });

    UTILS.pageOnMessage("C_IF_SET_INPUTS", (data) => {
      setTimeout(() => {
        setInput(data.input);
      }, 100);
    });
  }, [setInput]);

  // useEffect(() => {
  //    console.log(answers);
  // }, [answers]);

  // When closing, if focus is inside the chat, blur it to avoid aria/inert conflicts.
  useEffect(() => {
    if (!isOpen && rootRef.current) {
      const active = document.activeElement;
      if (active && rootRef.current.contains(active)) {
        try {
          active.blur();
        } catch (err) {
          // ignore
          void err;
        }
      }
    }
  }, [isOpen]);

  // Focus textarea when chat opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex flex-col h-full ${isOpen ? "animate-fadeIn" : ""}`}
      inert={!isOpen}
    >
      {/* Input area at the top */}
      <div
        className="p-4 border-b border-white/30 dark:border-white/20 bg-white/10 dark:bg-black/10 animate-slideUp"
        style={{ animationDelay: "100ms" }}
      >
        <div className="relative w-full grid gap-2">
          {/* Text input and buttons */}
          <div className="relative grid w-full h-[97px]">
            <div className="flex-1 relative path border-white/60 dark:border-black p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-black/20 text-gray-800 dark:text-white">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="w-[calc(100%-50px)] h-full resize-none text-sm bg-transparent border-0 outline-0 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                rows="3"
                autoFocus
              />
            </div>

            <button
              onClick={clearInput}
              className="absolute h-[30px] w-[30px] right-[5px] top-[5px] grid place-items-center rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-600 transition-all duration-200 cursor-pointer z-0 focus:outline-none"
              title="Clear input"
            >
              <IoClose size={24} />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={input.trim() === "" || isLoading}
              className={`absolute h-[45px] z-10 w-[40px] right-0 bottom-[5px] grid place-items-center rounded-lg border transition-all duration-200 focus:outline-none ${
                input.trim() === "" || isLoading
                  ? "bg-gray-300/40 dark:bg-gray-600/20 border-gray-400/40 dark:border-gray-500/30 text-gray-400 dark:text-gray-500"
                  : "bg-blue-500/60 border-blue-400/50 text-white hover:bg-blue-600/70 hover:border-blue-500/60"
              } cursor-pointer`}
              title={"Send message"}
            >
              <IoSend size={26} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Provider Selection Buttons */}
      <div className="relative w-full px-4 py-2 flex items-center gap-2 overflow-hidden">
        {/* Fixed History Button */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border bg-white/60 dark:bg-black/40 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-white/20 hover:bg-white/90 dark:hover:bg-black/60 shadow-sm cursor-pointer flex items-center gap-1.5"
          title="View Chat History"
        >
          <IoTimeOutline size={16} /> Chats
        </button>

        <div className="w-[1px] h-5 bg-gray-300 dark:bg-white/20 flex-shrink-0"></div>

        {/* Scrollable Provider List */}
        <div 
           ref={providerListRef}
           className="flex-1 flex flex-nowrap gap-2 items-center overflow-x-auto scrollbar-hide py-1.5 px-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-inner"
           style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayedProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 border relative focus:outline-none ${
                !answers[provider.id]
                  ? // Not loaded - disabled state
                    "bg-gray-200/50 dark:bg-gray-700/30 text-gray-400 dark:text-gray-500 border-gray-300/40 dark:border-gray-600/40 cursor-not-allowed opacity-50"
                  : selectedProvider === provider.id
                    ? // Active - selected state (light blue)
                      "bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300/60 dark:border-blue-600/50 shadow-sm cursor-pointer"
                    : // Loaded but not active - available state
                      "bg-white/50 dark:bg-black/30 text-gray-700 dark:text-gray-200 border-white/50 dark:border-white/30 hover:bg-white/70 dark:hover:bg-black/40 hover:border-white/60 cursor-pointer"
              }`}
              disabled={!answers[provider.id]}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-full flex-1 m-4 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 space-y-4 overflow-y-auto"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Question display */}
          {lastQuestion && (
            <div className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/25 p-3 rounded-xl">
              <div className="text-gray-800 dark:text-gray-200 font-medium">
                {lastQuestion}
              </div>
            </div>
          )}

          {/* Answers section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Answer
            </h3>

            {/* Display selected answer */}
            <div className="space-y-4">
              {answers[selectedProvider] && (
                <div className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/25 p-3 rounded-xl">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    {displayedProviders.find((p) => p.id === selectedProvider)?.name ||
                      selectedProvider}
                  </div>

                  <div
                    className="botChat whitespace-pre-wrap overflow-x-auto overflow-y-hidden"
                    dangerouslySetInnerHTML={{
                      __html: UTILS.sanitizeHtml(answers[selectedProvider].content),
                    }}
                  />
                </div>
              )}

              {/* Show loading for selected provider if no answer yet */}
              {isLoading && !answers[selectedProvider] && (
                <div className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/25 p-3 rounded-xl">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    {displayedProviders.find((p) => p.id === selectedProvider)?.name ||
                      selectedProvider}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <div
                      className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Overlay Panel */}
      <div
        className={`absolute inset-0 z-100 bg-gray-50/95 dark:bg-[#242424]/95 backdrop-blur-md flex flex-col transition-all duration-300 ease-in-out ${
          isHistoryOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none translate-y-4"
        }`}
      >
          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <IoTimeOutline size={20} /> Chat History
            </h2>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-1 rounded-lg bg-white dark:bg-black text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <IoTimeOutline size={48} className="mb-2 opacity-50" />
                <p>No history yet.</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setLastQuestion(item.question);
                    lastQuestionRef.current = item.question;
                    setAnswers(item.answers);
                    currentRequestIdRef.current = item.id;
                    setIsLoading(false);
                    // Select first available provider in the loaded history
                    const providersWithAnswers = Object.keys(item.answers);
                    if (providersWithAnswers.length > 0) {
                      // Check if current selected provider exists in this history item
                      if (!item.answers[selectedProvider]) {
                        setSelectedProvider(providersWithAnswers[0]);
                      }
                    }
                    setIsHistoryOpen(false);
                  }}
                  className="group relative bg-white/60 dark:bg-black/30 border border-gray-200 dark:border-white/10 p-3 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-black/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                        {item.question}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()} •{" "}
                        {Object.keys(item.answers).length} Providers
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div
              className="border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 overflow-hidden relative"
              style={{ height: "92px" }}
            >
              {/* Clear Button View */}
              <div
                className={`absolute inset-0 p-4 flex flex-col justify-center transition-all duration-300 ease-in-out ${
                  showConfirmClear
                    ? "opacity-0 scale-95 pointer-events-none"
                    : "opacity-100 scale-100 pointer-events-auto"
                }`}
              >
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 rounded-lg text-sm font-medium transition-all cursor-pointer"
                >
                  <IoTrashOutline size={18} /> Clear History
                </button>
              </div>

              {/* Confirm View */}
              <div
                className={`absolute inset-0 p-4 flex flex-col justify-center transition-all duration-300 ease-in-out ${
                  showConfirmClear
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-105 pointer-events-none"
                }`}
              >
                <p className="text-sm text-center text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Delete all history?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      saveHistory([]);
                      setShowConfirmClear(false);
                    }}
                    className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
