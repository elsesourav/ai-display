{
  /* Port used to communicate between isolated content script and page script */
  let port;
  try {
    port = document.getElementById("enable-copy-port");
    if (port) port.remove();
  } catch (e) {}

  port = document.createElement("span");
  port.id = "enable-copy-port";
  port.style.display = "none";
  document.documentElement.append(port);

  const isEnabled = () => port.dataset.enabled === "true";

  /* Helper to neutralize event cancellation */
  const allowEvent = (e) => {
    e.preventDefault = () => {};
    try {
      Object.defineProperty(e, "returnValue", {
        get: () => true,
        set: () => {},
        configurable: true,
      });
    } catch (err) {}
    try {
      Object.defineProperty(e, "defaultPrevented", {
        get: () => false,
        set: () => {},
        configurable: true,
      });
    } catch (err) {}
  };

  /* 1. Contextmenu: Stop sites from blocking right-click menu */
  window.addEventListener(
    "contextmenu",
    (e) => {
      if (isEnabled()) {
        e.stopImmediatePropagation();
      }
    },
    true
  );
  document.addEventListener(
    "contextmenu",
    (e) => {
      if (isEnabled()) {
        e.stopImmediatePropagation();
      }
    },
    true
  );

  /* 2. Copy: Allow copying and prevent site overrides */
  window.addEventListener(
    "copy",
    (e) => {
      if (isEnabled()) {
        allowEvent(e);
      }
    },
    true
  );
  document.addEventListener(
    "copy",
    (e) => {
      if (isEnabled()) {
        allowEvent(e);
      }
    },
    true
  );

  /* 3. Paste: Allow paste & restore inputs if cleared by website */
  const handlePaste = (e) => {
    if (!isEnabled()) return;
    const target = e.target;
    const tagName = target?.tagName;

    if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) {
      e.stopImmediatePropagation();
      if (tagName === "INPUT" || tagName === "TEXTAREA") {
        setTimeout(() => {
          const originalVal = target.value;
          if (!originalVal) return;
          let count = 0;
          const interval = setInterval(() => {
            if (++count > 20) {
              clearInterval(interval);
            } else if (target.value === "") {
              clearInterval(interval);
              target.value = originalVal;
              target.dispatchEvent(new Event("input", { bubbles: true }));
              target.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }, 30);
        }, 20);
      }
    } else {
      allowEvent(e);
    }
  };

  window.addEventListener("paste", handlePaste, true);
  document.addEventListener("paste", handlePaste, true);

  /* 4. BeforeInput: Unblock paste inputs */
  window.addEventListener(
    "beforeinput",
    (e) => {
      if (isEnabled()) {
        if (
          e.inputType === "insertFromPaste" ||
          e.inputType === "insertFromPasteAsQuotation" ||
          e.inputType === "insertReplacementText"
        ) {
          allowEvent(e);
        }
      }
    },
    true
  );

  /* 5. SelectStart & DragStart: Allow text selection and dragging */
  window.addEventListener(
    "selectstart",
    (e) => {
      if (isEnabled()) {
        allowEvent(e);
        e.stopImmediatePropagation();
      }
    },
    true
  );
  document.addEventListener(
    "selectstart",
    (e) => {
      if (isEnabled()) {
        allowEvent(e);
        e.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    "dragstart",
    (e) => {
      if (isEnabled()) {
        allowEvent(e);
      }
    },
    true
  );

  /* 6. Keydown: Allow Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A on Windows/Linux and Cmd+C, Cmd+V, Cmd+X, Cmd+A on Mac */
  window.addEventListener(
    "keydown",
    (e) => {
      if (!isEnabled()) return;
      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      const key = e.key?.toLowerCase();
      if (key === "c" || key === "v" || key === "x" || key === "a" || key === "insert") {
        e.stopImmediatePropagation();
      }
    },
    true
  );

  /* 7. Neutralize inline DOM handlers (e.g. document.oncontextmenu = () => false) */
  const dummyDescriptor = {
    get: () => null,
    set: () => {},
    configurable: true,
  };

  const overrideProperties = [
    "oncontextmenu",
    "oncopy",
    "onpaste",
    "oncut",
    "onbeforeinput",
    "onselectstart",
    "ondragstart",
  ];

  for (const prop of overrideProperties) {
    try {
      Object.defineProperty(window, prop, dummyDescriptor);
    } catch (e) {}
    try {
      Object.defineProperty(document, prop, dummyDescriptor);
    } catch (e) {}
    try {
      if (document.body) {
        Object.defineProperty(document.body, prop, dummyDescriptor);
      }
    } catch (e) {}
  }

  /* 8. CSS user-select unblocking */
  const STYLE_ID = "enable-copy-style-sheet";

  const applyCssUnlock = () => {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        *, *::before, *::after {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
          -webkit-touch-callout: default !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    // Sweep inline styles
    try {
      document.querySelectorAll("*").forEach((el) => {
        if (el.style && (el.style.userSelect === "none" || el.style.webkitUserSelect === "none")) {
          el.style.userSelect = "text";
          el.style.webkitUserSelect = "text";
        }
      });
    } catch (e) {}
  };

  const removeCssUnlock = () => {
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
  };

  /* Watch for port state changes from enableCopyIsolated.js */
  port.addEventListener("change", () => {
    if (isEnabled()) {
      applyCssUnlock();
    } else {
      removeCssUnlock();
    }
  });

  // Initial check once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (isEnabled()) applyCssUnlock();
    });
  } else {
    if (isEnabled()) applyCssUnlock();
  }
}
