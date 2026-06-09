/* --- Shared Helper --- */

/**
 * Opens a background tab, waits for it to load, executes a content
 * extraction function, and returns the cleaned HTML.
 *
 * @param {string} url - The URL to open
 * @param {Function} extractFn - Function to run inside the tab (must return a Promise<string>)
 * @param {Array} [extractArgs=[]] - Arguments to pass to extractFn
 * @returns {Promise<string>} The cleaned HTML result
 */
function fetchAiAnswer(url, extractFn, extractArgs = []) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url, active: false }, (tab) => {
      const tabId = tab.id;
      chromeTabMediaAccess(tabId, true);

      function listener(updatedTabId, info) {
        if (updatedTabId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          executeScriptReturn(
            tabId,
            extractFn,
            (injectResult) => {
              const cleanedHtml = injectResult?.[0]?.result || "";
              resolve(cleanedHtml);
              chromeTabMediaAccess(tabId, false);
              chrome.tabs.remove(tabId);
            },
            extractArgs,
          );
        }
      }

      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

/* --- Provider Functions --- */

async function getGoogleAiAnswer(q) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&sa=X&udm=50&hl=en`;

  return fetchAiAnswer(url, () => {
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
  });
}

async function getBingAiAnswer(q) {
  const url = `https://www.bing.com/copilotsearch?q=${encodeURIComponent(q)}&FORM=CSSCOP`;

  return fetchAiAnswer(url, () => {
    return new Promise(async (resolve) => {
      async function findContent() {
        const container = document
          .querySelector(".frame_cont iframe")
          ?.contentDocument?.querySelector(
            "#ca_main .gs_multianshead_main",
          );
        if (!container) return "";
        return await getProcessedHTML(container);
      }
      resolve(await pollForContent(findContent, "bing"));
    });
  });
}

async function getGrokAnswer(q) {
  const url = `https://grok.com/?q=${encodeURIComponent(q)}`;

  return fetchAiAnswer(url, () => {
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
  });
}

async function getPerplexityAnswer(q) {
  const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;

  return fetchAiAnswer(url, () => {
    return new Promise(async (resolve) => {
      async function findContent() {
        const container = document.querySelector("#markdown-content-0");
        if (!container) return "";
        return await getProcessedHTML(container, "perplexity");
      }
      resolve(await pollForContent(findContent));
    });
  });
}

async function getGeminiAnswer(q) {
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
  );
}
