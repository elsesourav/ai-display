// Force transparency on the iframe and its contents
document.documentElement.style.backgroundColor = "transparent";
document.documentElement.style.background = "none";
document.body.style.backgroundColor = "transparent";
document.body.style.background = "none";

// Apply transparency to all parent elements
if (window.parent) {
   try {
      const iframe = window.parent.document.querySelector(
         "iframe.aid-selection"
      );
      if (iframe) {
         iframe.style.backgroundColor = "transparent";
         iframe.style.background = "none";
      }
   } catch (e) {
      // Ignore cross-origin errors
      console.log(e);
   }
}
