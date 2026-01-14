/**
 * Captures simplified HTML content from the main app window.
 * On native platforms, this is not applicable, so we return an empty string.
 * @returns Empty string on native platforms
 */
function capturePageHTML(): string {
    return '';
}

export default capturePageHTML;
