const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const htmlFiles = glob.sync('src/app/**/*.html', { nodir: true });

const outFile = 'src/assets/i18n/en.json';

let translations = {};

// Preserve existing translations
if (fs.existsSync(outFile)) {
  try {
    translations = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  } catch (e) {
    console.warn('Could not read existing en.json');
  }
}

function shouldExtractText(text) {
  if (!text) return false;

  const trimmed = text.replace(/\s+/g, ' ').trim();

  if (!trimmed) return false;

  // Skip Angular expressions
  if (trimmed.includes('{{')) return false;

  // Skip URLs
  if (/https?:\/\//i.test(trimmed)) return false;

  // Skip single symbols
  if (/^[^\w]+$/.test(trimmed)) return false;

  return true;
}

function slugify(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-Z0-9 ]+/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase()
    .substring(0, 60);
}

htmlFiles.forEach(file => {

  console.log(`Processing: ${file}`);

  const raw = fs.readFileSync(file, 'utf8');

  const $ = cheerio.load(raw, {
    decodeEntities: false
  });

  $('*').each((_, el) => {

    const tag = (el.tagName || '').toLowerCase();

    // NEVER touch these tags
    if (
      [
        'script',
        'style',
        'head',
        'title',
        'meta',
        'link',
        'svg',
        'path'
      ].includes(tag)
    ) {
      return;
    }

    $(el).contents().each((_, child) => {

      if (child.type !== 'text') return;

      const original = child.data.trim();

      if (!shouldExtractText(original)) return;

      const key = `APP_${slugify(original)}`;

      if (!translations[key]) {
        translations[key] = original;
      }

      child.data = `{{ '${key}' | translate }}`;
    });
  });

  fs.writeFileSync(file, $.html(), 'utf8');
});

fs.mkdirSync(path.dirname(outFile), {
  recursive: true
});

fs.writeFileSync(
  outFile,
  JSON.stringify(translations, null, 2),
  'utf8'
);

console.log('✅ Extraction complete');
console.log(`Files scanned: ${htmlFiles.length}`);
console.log(`Keys written: ${Object.keys(translations).length}`);
console.log(`Output file: ${outFile}`);