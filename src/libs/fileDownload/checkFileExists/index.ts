/**
 * Checks if a file exists at the given path.
 * Web implementation - checks if the blob URL is still valid.
 * 
 * @param path - The file path or blob URL to check
 * @returns Promise that resolves to true if file exists, false otherwise
 */
async function checkFileExists(path: string | undefined): Promise<boolean> {
    if (!path) {
        return false;
    }

    // For web, we need to check if blob URLs are still valid
    // Blob URLs (blob://) expire when the page is refreshed
    if (path.startsWith('blob:')) {
        try {
            // Try to fetch the blob URL with HEAD request
            const response = await fetch(path, { method: 'HEAD' });
            return response.ok;
        } catch {
            // Blob URL no longer exists
            return false;
        }
    }

    // For regular URLs, assume they exist
    // (actual validation would require server check)
    return true;
}

export default checkFileExists;