function extractTextWithMark(html) {
   const parser = new DOMParser();
   const doc = parser.parseFromString(html, "text/html");

   const mark = doc.querySelector("mark");
   if (!mark) return "";

   let parent = mark?.parentElement?.parentElement?.parentElement;
   if (!parent) return "";

   // clone so we don’t touch the real DOM
   let clone = parent.cloneNode(true);

   // remove everything except <mark> and text
   clone.querySelectorAll("*").forEach((el) => {
      if (el.tagName.toLowerCase() !== "mark") {
         el.replaceWith(...el.childNodes);
      }
   });

   return clone.innerHTML.trim();
}

async function getGoogleAnswer(query) {
   try {
      const url = `https://www.google.com/search?q=${encodeURI(query)}`;

      const html = await fetch(url).then((r) => r.text());

      console.log(extractTextWithMark(html));

      return extractTextWithMark(html);
   } catch (error) {
      console.error("Error fetching Google search results:", error);
   }
}
getGoogleAnswer("what is c");

("https://www.google.com/search?q=While%20it%20is%20impossible%20to%20define%20a%20single%20%22hardest%22%20math%20question,%20as%20difficulty%20is%20subjective%20and%20depends%20on%20the%20specific%20field%20of%20mathematics,%20some%20problems%20are%20notoriously%20challenging.%20The%20hardest%20of%20these%20tend%20to%20be%20unsolved,%20foundational%20questions%20in%20mathematics%20that%20have%20resisted%20proof%20for%20decades%20or%20even%20centuries.");

("https://www.google.com/search?q=While%20it%20is%20impossible%20to%20define%20a%20single%20%22hardest%22%20math%20question,%20as%20difficulty%20is%20subjective%20and%20depends%20on%20the%20specific%20field%20of%20mathematics,%20some%20problems%20are%20notoriously%20challenging.%20The%20hardest%20of%20these%20tend%20to%20be%20unsolved,%20foundational%20questions%20in%20mathematics%20that%20have%20resisted%20proof%20for%20decades%20or%20even%20centuries.");
