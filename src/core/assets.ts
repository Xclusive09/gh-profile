import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Downloads a file from a URL and saves it to a destination.
 * Retries up to 3 times with exponential backoff.
 */
async function downloadFile(url: string, dest: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(new URL(url), {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'gh-profile-generator/1.0.0'
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Status ${response.status}: ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            await fs.writeFile(dest, Buffer.from(buffer));
            return; // Success
        } catch (err: any) {
            if (i === retries - 1) throw err; // Throw on last attempt
            const delay = Math.pow(2, i) * 1000;
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

/**
 * Generates a short hash for a URL to use as a filename.
 */
function getHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
}

/**
 * Extracts the extension from a URL or defaults to .svg
 */
function getExtension(url: string): string {
    const cleanUrl = url.split('?')[0];
    const ext = path.extname(cleanUrl);
    if (ext && ext.length < 5) return ext;
    // Guess based on provider
    if (url.includes('shields.io')) return '.svg';
    if (url.includes('skillicons.dev')) return '.svg';
    if (url.includes('github-readme-stats')) return '.svg';
    if (url.includes('komarev.com')) return '.svg';
    return '.png'; // Fallback
}

/**
 * Scans markdown for external images, downloads them to an 'assets' folder,
 * and updates the markdown to use relative local paths.
 */
export async function makeAssetsLocal(
    markdown: string,
    outputPath: string
): Promise<string> {
    const outputDir = path.dirname(path.resolve(outputPath));
    const assetsDir = path.join(outputDir, 'assets');

    // Ensure assets directory exists
    try {
        await fs.mkdir(assetsDir, { recursive: true });
    } catch (e) {
        // ignore if exists
    }

    let updatedMarkdown = markdown;

    // 1. Find all image URLs
    // Matches: ![...](url) and <img src="url" ...>
    const mdImageRegex = /!\[.*?\]\((https?:\/\/[^)]+)\)/g;
    const htmlImageRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/g;

    const urls = new Set<string>();

    let match;
    while ((match = mdImageRegex.exec(markdown)) !== null) {
        urls.add(match[1]);
    }
    while ((match = htmlImageRegex.exec(markdown)) !== null) {
        urls.add(match[1]);
    }

    // 2. Download each URL
    const urlArray = Array.from(urls);
    const downloadMap = new Map<string, string>();

    for (const url of urlArray) {
        try {
            const ext = getExtension(url);
            const filename = `${getHash(url)}${ext}`;
            const destPath = path.join(assetsDir, filename);
            const relativePath = `./assets/${filename}`;

            // Check if file exists to avoid re-downloading (optional, but good for speed)
            // For now, always download to ensure freshness as per user request (snapshot)
            await downloadFile(url, destPath);

            downloadMap.set(url, relativePath);
        } catch (error) {
            console.error(`Warning: Failed to download asset ${url}`, error);
            // If download fails, keep original URL
        }
    }

    // 3. Replace URLs in Markdown
    // We replace specifically the matched strings to avoid accidental partial replacements
    downloadMap.forEach((localPath, remoteUrl) => {
        // Escape regex special chars in the remote URL for replacement
        const escapedUrl = remoteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Replace in Markdown syntax ![...](URL)
        updatedMarkdown = updatedMarkdown.replace(
            new RegExp(`(!\\[.*?\\])\\(${escapedUrl}\\)`, 'g'),
            `$1(${localPath})`
        );

        // Replace in HTML syntax src="URL"
        updatedMarkdown = updatedMarkdown.replace(
            new RegExp(`(<img[^>]+src=["'])${escapedUrl}(["'][^>]*>)`, 'g'),
            `$1${localPath}$2`
        );
    });

    return updatedMarkdown;
}
