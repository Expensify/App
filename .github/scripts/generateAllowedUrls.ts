import fs from 'fs';
import path from 'path';

/**
 * Script to extract all URLs from help articles and generate a whitelist.
 * Run this at build time to update the allowed URLs list.
 *
 * Usage: npx ts-node .github/scripts/generateAllowedUrls.ts
 */

const DOCS_DIR = path.join(__dirname, '..', '..', 'docs');
const OUTPUT_FILE = path.join(DOCS_DIR, 'assets', 'js', 'allowedExternalUrls.json');

// Regex to match URLs in markdown
// Matches: [text](url), <url>, and bare URLs
const URL_PATTERNS = [
    /\[.*?\]\((https?:\/\/[^)\s]+)\)/g, // Markdown links [text](url)
    /<(https?:\/\/[^>\s]+)>/g, // Angle bracket URLs <url>
    /(?<![([])(https?:\/\/[^\s)\]>"']+)/g, // Bare URLs
];

function findMarkdownFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir, {withFileTypes: true});

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('_site')) {
            files.push(...findMarkdownFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    return files;
}

function extractUrls(content: string): Set<string> {
    const urls = new Set<string>();

    for (const pattern of URL_PATTERNS) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match = regex.exec(content);
        while (match !== null) {
            // Get the captured group (URL) or the full match
            const url = match[1] || match[0];
            // Clean up trailing punctuation that might be captured
            const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
            if (cleanUrl.startsWith('http')) {
                urls.add(cleanUrl);
            }
            match = regex.exec(content);
        }
    }
    return urls;
}

function main() {
    console.log('Scanning markdown files for URLs...');

    const allUrls = new Set<string>();
    const markdownFiles = findMarkdownFiles(DOCS_DIR);

    console.log(`Found ${markdownFiles.length} markdown files`);

    for (const file of markdownFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const urls = extractUrls(content);
        for (const url of urls) {
            allUrls.add(url);
        }
    }

    // Filter out Expensify URLs (check domain properly) and sort
    const urlList = Array.from(allUrls)
        .filter((url) => {
            try {
                const hostname = new URL(url).hostname;
                return hostname !== 'expensify.com' && !hostname.endsWith('.expensify.com');
            } catch {
                return false;
            }
        })
        .sort();

    console.log(`Found ${urlList.length} unique URLs`);

    // Write to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(urlList, null, 2));
    console.log(`Written to ${OUTPUT_FILE}`);
}

main();
