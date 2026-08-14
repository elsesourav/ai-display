/* --- Request Cancellation State --- */
let currentRequestId = null;
let activeAiTabs = [];

/* --- Shared Helper --- */

/**
 * Opens a background tab, waits for it to load, executes a content
 * extraction function, and returns the cleaned HTML.
 *
 * @param {string} url - The URL to open
 * @param {Function} extractFn - Function to run inside the tab (must return a Promise<string>)
 * @param {Array} [extractArgs=[]] - Arguments to pass to extractFn
 * @param {string} [requestId=null] - The unique ID for the current batch of requests
 * @returns {Promise<string>} The cleaned HTML result
 */
function fetchAiAnswer(url, extractFn, extractArgs = [], requestId = null) {
  return new Promise((resolve) => {
    // If we have a new requestId, cancel all existing fetching tabs
    if (requestId && currentRequestId !== requestId) {
      activeAiTabs.forEach((id) => {
        chrome.tabs.remove(id).catch(() => {});
      });
      activeAiTabs = [];
      currentRequestId = requestId;
    }

    let isResolved = false;
    let timeoutId = null;

    chrome.tabs.create({ url, active: false }, (tab) => {
      if (!tab || !tab.id) {
        resolve("<mark>Unable to open query tab. Please try again.</mark>");
        return;
      }

      const tabId = tab.id;
      activeAiTabs.push(tabId);
      chromeTabMediaAccess(tabId, true);

      function cleanup() {
        if (timeoutId) clearTimeout(timeoutId);
        chromeTabMediaAccess(tabId, false);
        chrome.tabs.remove(tabId).catch(() => {});
        activeAiTabs = activeAiTabs.filter((id) => id !== tabId);
      }

      function safeResolve(val) {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(val);
        }
      }

      // 25s timeout protection
      timeoutId = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.onRemoved.removeListener(onRemoved);
        safeResolve("<mark>Request timed out. Please check your network connection.</mark>");
      }, 25000);

      function listener(updatedTabId, info) {
        if (updatedTabId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.onRemoved.removeListener(onRemoved);

          executeScriptReturn(
            tabId,
            extractFn,
            (injectResult) => {
              const cleanedHtml = injectResult?.[0]?.result || "";
              safeResolve(cleanedHtml);
            },
            extractArgs,
          );
        }
      }

      chrome.tabs.onUpdated.addListener(listener);

      // Handle cases where the tab is closed before it finishes (e.g. by cancellation)
      function onRemoved(removedTabId) {
        if (removedTabId === tabId) {
          chrome.tabs.onRemoved.removeListener(onRemoved);
          chrome.tabs.onUpdated.removeListener(listener);
          safeResolve(""); // Resolve empty to let the UI discard it
        }
      }
      chrome.tabs.onRemoved.addListener(onRemoved);
    });
  });
}

/* --- Provider Functions --- */

async function getGoogleAiAnswer(q, requestId) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&sa=X&udm=50&hl=en`;

  return fetchAiAnswer(
    url,
    () => {
      return new Promise(async (resolve) => {
        async function findContent() {
          const container = document.querySelector(
            'div[data-container-id="main-col"]',
          );
          if (!container) return null;
          return await getProcessedHTML(container, "google");
        }
        resolve(await pollForContent(findContent));
      });
    },
    [],
    requestId,
  );
}

async function getBingAiAnswer(q, requestId) {
  const url = `https://www.bing.com/copilotsearch?q=${encodeURIComponent(q)}&FORM=CSSCOP`;

  return fetchAiAnswer(
    url,
    () => {
      return new Promise(async (resolve) => {
        async function findContent() {
          const container = document
            .querySelector(".frame_cont iframe")
            ?.contentDocument?.querySelector("#ca_main .gs_multianshead_main");
          if (!container) return "";
          return await getProcessedHTML(container);
        }
        resolve(await pollForContent(findContent, "bing"));
      });
    },
    [],
    requestId,
  );
}

async function getGrokAnswer(q, requestId) {
  const url = `https://grok.com/?q=${encodeURIComponent(q)}`;

  return fetchAiAnswer(
    url,
    () => {
      return new Promise(async (resolve) => {
        async function findContent() {
          const container1 = document.querySelector(
            "main #last-reply-container > div:nth-child(2) > div > [dir='auto']",
          );
          const container2 = document.querySelector(
            "main #last-reply-container .thinking-container ~ div",
          );

          const isLimitOver = [...document.querySelectorAll("div")].find((el) =>
            el
              .querySelector("h2")
              ?.textContent.includes("Sign up to continue with Grok"),
          );

          if (isLimitOver) return false;
          if (!container1 && !container2) return "";

          return await getProcessedHTML(container1 || container2, "grok");
        }
        resolve(await pollForContent(findContent));
      });
    },
    [],
    requestId,
  );
}

async function getPerplexityAnswer(q, requestId) {
  const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;

  return fetchAiAnswer(
    url,
    () => {
      return new Promise(async (resolve) => {
        async function findContent() {
          const container = document.querySelector("#markdown-content-0");
          if (!container) return "";
          return await getProcessedHTML(container, "perplexity");
        }
        resolve(await pollForContent(findContent));
      });
    },
    [],
    requestId,
  );
}

async function getGeminiAnswer(q, requestId) {
  const url = "https://gemini.google.com/app?hl=en";

  return fetchAiAnswer(
    url,
    (prompt) => {
      return new Promise(async (resolve) => {
        const getSearchArea = () => {
          return document.querySelector(
            "div.ql-editor.textarea, rich-textarea > div, div[contenteditable='true']",
          );
        };

        const isFindSearchArea = await pollForContent(getSearchArea);
        if (!isFindSearchArea) {
          resolve("");
          return;
        }

        await submitToGemini(prompt);

        async function findContent() {
          const container = document.querySelector(".markdown-main-panel");
          if (!container) return "";
          return await getProcessedHTML(container, "gemini");
        }
        resolve(await pollForContent(findContent));
      });
    },
    [q],
    requestId,
  );
}
