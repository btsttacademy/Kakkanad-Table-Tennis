// Enable Babel so Node can understand JSX and ES6 imports
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

// Import required modules
const fs = require("fs");
const path = require("path");

// ======== CONFIGURATION ==========
const BASE_URL = "https://btsttacademy.in/"; // 🔹 Change this to your actual domain
const SRC_DIR = path.join(__dirname, "src");
const OUTPUT_FILE = path.join(__dirname, "public", "sitemap.xml");
// =================================

// Function to recursively get all .js or .jsx files in src
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

// Generate URLs based on filenames
function generateUrls(files) {
  return files
    .map((file) => {
      let route = file.replace(SRC_DIR, "").replace(/\\/g, "/");
      route = route
        .replace(/\/index\.jsx?$/, "/")
        .replace(/\.jsx?$/, "")
        .replace(/^\/+/, "");

      if (route === "") route = "/"; // Home route
      return `${BASE_URL}/${route}`;
    })
    .filter((url, index, self) => self.indexOf(url) === index); // remove duplicates
}

// Create sitemap XML
function generateSitemap(urls) {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  fs.writeFileSync(OUTPUT_FILE, sitemapContent, "utf8");
  console.log(`✅ Sitemap generated successfully at: ${OUTPUT_FILE}`);
}

// Main script
(function main() {
  try {
    const files = getAllFiles(SRC_DIR);
    const urls = generateUrls(files);
    generateSitemap(urls);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
  }
})();
