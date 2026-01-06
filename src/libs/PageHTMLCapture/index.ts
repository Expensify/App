import Navigation from '@libs/Navigation/Navigation';

/**
 * Captures simplified HTML content from the main app window.
 * Extracts semantic HTML elements, visible text, and useful attributes.
 * @returns Simplified HTML string wrapped with page URL
 */
function capturePageHTML(): string {
    try {
        // Get the current page URL
        const currentPath = Navigation.getActiveRoute();
        const pageURL = currentPath || '/';

        // Get the main content container (excluding the side panel)
        const mainContent = document.querySelector<HTMLElement>('#root');
        if (!mainContent) {
            return '';
        }

        // Extract simplified HTML
        const simplifiedHTML = extractSimplifiedHTML(mainContent);

        // Wrap with page URL
        return `<page url="${escapeHtml(pageURL)}">${simplifiedHTML}</page>`;
    } catch (error) {
        console.error('[PageHTMLCapture] Error capturing page HTML:', error);
        return '';
    }
}

/**
 * Recursively extracts simplified HTML from an element.
 * Includes semantic elements, visible text, and useful attributes.
 */
function extractSimplifiedHTML(element: HTMLElement): string {
    const result: string[] = [];

    // Skip side panel and modal content
    if (
        element.classList.contains('side-panel') ||
        element.getAttribute('data-testid') === 'side-panel' ||
        element.getAttribute('role') === 'dialog' ||
        element.classList.contains('modal')
    ) {
        return '';
    }

    // Process child nodes
    const childNodes = Array.from(element.childNodes);
    for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Include visible text content, but skip if it's just whitespace or single character icons
            const text = node.textContent?.trim();
            if (text && text.length > 1 && !isIconText(text)) {
                result.push(escapeHtml(text));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const childElement = node as HTMLElement;

            // Skip hidden elements
            const style = window.getComputedStyle(childElement);
            if (style.display === 'none' || style.visibility === 'hidden') {
                continue;
            }

            const tagName = childElement.tagName.toLowerCase();

            // SKIP SVGs, images, and icon elements completely
            if (tagName === 'svg' || tagName === 'img' || tagName === 'picture' || childElement.classList.contains('icon')) {
                continue;
            }

            // List of semantic elements we want to capture
            const semanticElements = ['button', 'a', 'input', 'textarea', 'select', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'nav', 'header', 'footer', 'main', 'form', 'label'];

            if (semanticElements.includes(tagName)) {
                // Build simplified element with ONLY essential attributes
                const attrs: string[] = [];

                // ONLY include these essential attributes (NOTHING else):

                // For links: only href (if it's not just an icon link)
                if (tagName === 'a') {
                    const href = childElement.getAttribute('href');
                    if (href && !href.startsWith('javascript:')) {
                        attrs.push(`href="${escapeHtml(href)}"`);
                    }
                }

                // For inputs: only type and placeholder (NO values for security)
                if (tagName === 'input') {
                    const type = childElement.getAttribute('type');
                    if (type && type !== 'hidden') {
                        attrs.push(`type="${escapeHtml(type)}"`);
                    }
                    const placeholder = childElement.getAttribute('placeholder');
                    if (placeholder) {
                        attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
                    }
                }

                // For textareas: only placeholder
                if (tagName === 'textarea') {
                    const placeholder = childElement.getAttribute('placeholder');
                    if (placeholder) {
                        attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
                    }
                }

                // For buttons and interactive elements: only aria-label if meaningful
                if (['button', 'a'].includes(tagName)) {
                    const ariaLabel = childElement.getAttribute('aria-label');
                    if (ariaLabel && !isIconText(ariaLabel)) {
                        attrs.push(`aria-label="${escapeHtml(ariaLabel)}"`);
                    }
                }

                // Get inner content recursively
                const innerContent = extractSimplifiedHTML(childElement);

                // Only include elements that have meaningful content or attributes
                if (innerContent || attrs.length > 0) {
                    const attrString = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
                    if (innerContent) {
                        result.push(`<${tagName}${attrString}>${innerContent}</${tagName}>`);
                    } else if (attrs.length > 0) {
                        // Only create empty elements if they have useful attributes (like inputs with placeholders)
                        result.push(`<${tagName}${attrString}></${tagName}>`);
                    }
                }
            } else {
                // For non-semantic elements (div, span, etc.), just extract their content
                const innerContent = extractSimplifiedHTML(childElement);
                if (innerContent) {
                    result.push(innerContent);
                }
            }
        }
    }

    // Normalize whitespace: collapse multiple spaces into one and trim
    return result.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if text is likely icon/emoji text that should be filtered out
 */
function isIconText(text: string): boolean {
    // Filter out single character text (often icons/emojis)
    if (text.length === 1) {
        return true;
    }

    // Filter out common icon unicode ranges
    const iconPatterns = [
        /[\u2000-\u2BFF]/, // General punctuation, arrows, mathematical operators
        /[\u2600-\u27BF]/, // Miscellaneous symbols (includes many icons)
        /[\uE000-\uF8FF]/, // Private use area (custom icons)
        /[\uD800-\uDFFF]/, // Surrogate pairs (emoji)
        /^[\u00A0\s]+$/, // Only whitespace/nbsp
    ];

    return iconPatterns.some((pattern) => pattern.test(text));
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

export default capturePageHTML;
