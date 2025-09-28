const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');
const cheerio = require('cheerio');

const glob = require('glob');
const htmlFiles = glob.sync('src/app/**/*.html', { nodir: true });
let translations = {}; // fresh every run

// 2. Tags to exclude from translation (critical!)
const EXCLUDED_TAGS = ['style', 'script', 'title', 'meta', 'link', 'head', 'section-icon'];

function shouldExtractText(text) {
  if (!text) return false;
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return false;
  if (trimmed.includes('{{') || trimmed.includes('}}')) return false;
  return true;
}
// Simple slugify: convert text into ALL_CAPS_UNDERSCORE_KEY
function slugify(text) {
  return text
    .replace(/<[^>]*>/g, '')               // Remove HTML tags
    .replace(/[^a-zA-Z0-9 ]+/g, ' ')        // Remove special chars
    .trim()
    .replace(/\s+/g, '_')                  // Replace spaces with _
    .toUpperCase();
}

// 3. Loop through each HTML file
htmlFiles.forEach(file => {
  const raw = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(raw, { decodeEntities: false });

  $('*').each((_, el) => {
    const tagName = el.tagName?.toLowerCase?.();
    if (EXCLUDED_TAGS.includes(tagName)) return;

    $(el).contents().each((_, child) => {
      if (child.type === 'text') {
        const original = child.data.trim();
        if (shouldExtractText(original)) {
          const key = `APP_${slugify(original).slice(0, 40)}`;
          translations[key] = original;
          child.data = `{{ '${key}' | translate }}`;
        }
      }
    });
  });


 // 4. Write back modified HTML with translations
  fs.writeFileSync(file, $.html(), 'utf8');
});


// 5. Write out en.json
const outFile = 'src/assets/i18n/en.json';
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(translations, null, 2), 'utf8');

console.log('✅ Extraction complete');
console.log('Files scanned:', htmlFiles.length);
console.log('Keys written:', Object.keys(translations).length);
console.log(`Output file: ${outFile}`);
