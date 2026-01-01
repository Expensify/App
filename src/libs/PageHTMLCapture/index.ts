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
        const mainContent = document.querySelector('#root') as HTMLElement;
        if (!mainContent) {
            return '';
        }

        // Extract simplified HTML
        const simplifiedHTML = extractSimplifiedHTML(mainContent);

        // Wrap with page URL
        return `<page url="${pageURL}">\n${simplifiedHTML}\n</page>`;
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
            // Include visible text content
            const text = node.textContent?.trim();
            if (text) {
                result.push(text);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const childElement = node as HTMLElement;

            // Skip hidden elements
            const style = window.getComputedStyle(childElement);
            if (style.display === 'none' || style.visibility === 'hidden') {
                continue;
            }

            const tagName = childElement.tagName.toLowerCase();

            // Check if this is a semantic element we want to capture
            const semanticElements = [
                'button',
                'a',
                'input',
                'textarea',
                'select',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'nav',
                'header',
                'footer',
                'article',
                'section',
                'aside',
                'main',
                'form',
                'label',
                'img',
            ];

            if (semanticElements.includes(tagName)) {
                // Build simplified element representation
                const attrs: string[] = [];

                // Include useful attributes
                const ariaLabel = childElement.getAttribute('aria-label');
                if (ariaLabel) {
                    attrs.push(`aria-label="${ariaLabel}"`);
                }

                const href = childElement.getAttribute('href');
                if (href && tagName === 'a') {
                    attrs.push(`href="${href}"`);
                }

                const alt = childElement.getAttribute('alt');
                if (alt && tagName === 'img') {
                    attrs.push(`alt="${alt}"`);
                }

                const placeholder = childElement.getAttribute('placeholder');
                if (placeholder && (tagName === 'input' || tagName === 'textarea')) {
                    attrs.push(`placeholder="${placeholder}"`);
                }

                const type = childElement.getAttribute('type');
                if (type && tagName === 'input') {
                    attrs.push(`type="${type}"`);
                }

                const value = (childElement as HTMLInputElement).value;
                if (value && (tagName === 'input' || tagName === 'textarea')) {
                    attrs.push(`value="${value}"`);
                }

                // Get inner content
                const innerContent = extractSimplifiedHTML(childElement);

                // Build element string
                const attrString = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
                if (innerContent) {
                    result.push(`<${tagName}${attrString}>${innerContent}</${tagName}>`);
                } else {
                    result.push(`<${tagName}${attrString} />`);
                }
            } else {
                // For non-semantic elements, just extract their content
                const innerContent = extractSimplifiedHTML(childElement);
                if (innerContent) {
                    result.push(innerContent);
                }
            }
        }
    }

    return result.join(' ');
}

export default capturePageHTML;
