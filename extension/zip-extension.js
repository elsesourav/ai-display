import archiver from "archiver";
import { createWriteStream, existsSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function zipExtension() {
   const extensionDir = "./extension";
   const outputPath = "./ai-display-extension.zip";

   // Check if extension directory exists
   if (!existsSync(extensionDir)) {
      console.error(
         '❌ Extension directory not found. Run "npm run build" first.'
      );
      process.exit(1);
   }

   console.log("📦 Creating extension zip file...");

   // Create a file to stream archive data to
   const output = createWriteStream(outputPath);
   const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
   });

   // Listen for all archive data to be written
   output.on("close", function () {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Extension zipped successfully!`);
      console.log(`📁 File: ${outputPath}`);
      console.log(`📊 Size: ${sizeInMB} MB (${archive.pointer()} bytes)`);
      console.log(`🚀 Ready to upload to Chrome Web Store!`);

      // Update README.md with the latest size and date
      try {
         const fs = require("fs");
         const readmePath = "./README.md";
         if (fs.existsSync(readmePath)) {
            let readmeContent = fs.readFileSync(readmePath, "utf8");
            
            const dateStr = new Date().toISOString().split("T")[0];
            const downloadLinkRegex = /\*\*\[⬇️ Download Here\]\([^)]+\)\*\*.*$/m;
            
            if (downloadLinkRegex.test(readmeContent)) {
               readmeContent = readmeContent.replace(
                  downloadLinkRegex,
                  `**[⬇️ Download Here](https://github.com/elsesourav/ai-display/raw/main/ai-display-extension.zip)** *(Size: ${sizeInMB} MB, Updated: ${dateStr})*`
               );
               fs.writeFileSync(readmePath, readmeContent, "utf8");
               console.log("📝 README.md updated with latest download info.");
            }
         }
      } catch (err) {
         console.error("❌ Failed to update README.md:", err.message);
      }
   });

   // Handle warnings
   archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
         console.warn("⚠️ Warning:", err.message);
      } else {
         throw err;
      }
   });

   // Handle errors
   archive.on("error", function (err) {
      console.error("❌ Error creating zip:", err.message);
      throw err;
   });

   // Pipe archive data to the file
   archive.pipe(output);

   // Add the entire extension directory
   archive.directory(extensionDir, false);

   // Finalize the archive
   await archive.finalize();
}

// Run the zip function
zipExtension().catch(console.error);
