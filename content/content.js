

console.log("content script loaded");

if (location.href.includes("flipkart.com")) {

   runtimeSendMessage("c_b", (r) => {
      resolve(r);
   });
}