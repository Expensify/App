import Navigation from '@libs/Navigation/Navigation';

/**
 * Captures simplified HTML content from the main app window.
 * Extracts semantic HTML elements, visible text, and useful attributes.
 * @returns Simplified HTML string wrapped with page URL
 */
function capturePageHTML(): string {
    try {
        const currentPath = Navigation.getActiveRoute();
        const pageURL = currentPath || '/';

        const mainContent = document.querySelector<HTMLElement>('#root');
        if (!mainContent) {
            return '';
        }

        const simplifiedHTML = extractSimplifiedHTML(mainContent);

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

    if (
        element.classList.contains('side-panel') ||
        element.getAttribute('data-testid') === 'side-panel' ||
        element.getAttribute('role') === 'dialog' ||
        element.classList.contains('modal')
    ) {
        return '';
    }

    const childNodes = Array.from(element.childNodes);
    for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text && text.length > 1 && !isIconText(text)) {
                result.push(escapeHtml(text));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const childElement = node as HTMLElement;

            const style = window.getComputedStyle(childElement);
            if (style.display === 'none' || style.visibility === 'hidden') {
                continue;
            }

            const tagName = childElement.tagName.toLowerCase();

            if (tagName === 'svg' || tagName === 'img' || tagName === 'picture' || childElement.classList.contains('icon')) {
                continue;
            }

            const semanticElements = ['button', 'a', 'input', 'textarea', 'select', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'nav', 'header', 'footer', 'main', 'form', 'label'];

            if (semanticElements.includes(tagName)) {
                const attrs: string[] = [];

                if (tagName === 'a') {
                    const href = childElement.getAttribute('href');
                    if (href && href.length > 0 && href !== '#') {
                        attrs.push(`href="${escapeHtml(href)}"`);
                    }
                }

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

                if (tagName === 'textarea') {
                    const placeholder = childElement.getAttribute('placeholder');
                    if (placeholder) {
                        attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
                    }
                }

                if (['button', 'a'].includes(tagName)) {
                    const ariaLabel = childElement.getAttribute('aria-label');
                    if (ariaLabel && !isIconText(ariaLabel)) {
                        attrs.push(`aria-label="${escapeHtml(ariaLabel)}"`);
                    }
                }

                const innerContent = extractSimplifiedHTML(childElement);

                if (innerContent || attrs.length > 0) {
                    const attrString = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
                    if (innerContent) {
                        result.push(`<${tagName}${attrString}>${innerContent}</${tagName}>`);
                    } else if (attrs.length > 0) {
                        result.push(`<${tagName}${attrString}></${tagName}>`);
                    }
                }
            } else {
                const innerContent = extractSimplifiedHTML(childElement);
                if (innerContent) {
                    result.push(innerContent);
                }
            }
        }
    }

    return result.join(' ').replaceAll(/\s+/g, ' ').trim();
}

function isIconText(text: string): boolean {
    if (text.length === 1) {
        return true;
    }

    const iconPatterns = [/[\u2000-\u2BFF]/, /[\u2600-\u27BF]/, /[\uE000-\uF8FF]/, /[\uD800-\uDFFF]/, /^[\u00A0\s]+$/];

    return iconPatterns.some((pattern) => pattern.test(text));
}

function escapeHtml(text: string): string {
    return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export default capturePageHTML;
