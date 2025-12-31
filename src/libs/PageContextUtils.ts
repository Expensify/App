const MAX_HTML_SIZE = 50 * 1024; // 50KB limit

// Only semantic elements we want to capture
const SEMANTIC_ELEMENTS = new Set([
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
    'main',
    'form',
    'label',
    'ul',
    'ol',
    'li',
]);

// Attributes we want to keep (everything else is stripped)
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
    a: ['href', 'aria-label'],
    input: ['type', 'placeholder', 'aria-label'],
    textarea: ['placeholder', 'aria-label'],
    button: ['aria-label'],
    select: ['aria-label'],
    label: ['for'],
};

/**
 * Check if an element is visible
 */
function isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    // Check if element is hidden
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }

    // Check if element has dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        return false;
    }

    return true;
}

/**
 * Check if element is part of side panel or modal
 */
function isExcludedContent(element: Element): boolean {
    // Exclude side panel
    if (element.closest('[data-testid="side-panel"]')) {
        return true;
    }

    // Exclude modals
    if (element.closest('[role="dialog"]') || element.closest('[role="alertdialog"]')) {
        return true;
    }

    return false;
}

/**
 * Get direct text content only (not from child elements)
 */
function getDirectTextContent(element: Element): string {
    let text = '';
    
    // Only get text from direct text nodes, not from child elements
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent || '';
        }
    });
    
    return text.trim().replace(/\s+/g, ' ').slice(0, 100);
}

/**
 * Sanitize and simplify an element
 */
function sanitizeElement(element: Element): string {
    const tagName = element.tagName.toLowerCase();

    // Skip if not a semantic element
    if (!SEMANTIC_ELEMENTS.has(tagName)) {
        return '';
    }

    // Skip if not visible
    if (!isElementVisible(element)) {
        return '';
    }

    // Skip if in excluded content
    if (isExcludedContent(element)) {
        return '';
    }

    // Skip password inputs for security
    if (tagName === 'input' && element.getAttribute('type') === 'password') {
        return '';
    }

    // Get allowed attributes for this tag
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
    const attributes: string[] = [];

    allowedAttrs.forEach((attr) => {
        const value = element.getAttribute(attr);
        if (value) {
            // Escape quotes in attribute values
            const escapedValue = value.replace(/"/g, '&quot;');
            attributes.push(`${attr}="${escapedValue}"`);
        }
    });

    // Get ONLY direct text content (not from children)
    const textContent = getDirectTextContent(element);

    // Build the simplified element
    const attrString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
    
    // Self-closing tags
    if (tagName === 'input') {
        return `<${tagName}${attrString}>`;
    }

    // Only include text if there is any
    if (textContent) {
        return `<${tagName}${attrString}>${textContent}</${tagName}>`;
    }

    return `<${tagName}${attrString}></${tagName}>`;
}

/**
 * Recursively process DOM nodes
 */
function processNode(node: Node, result: string[]): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const sanitized = sanitizeElement(element);
        
        if (sanitized) {
            result.push(sanitized);
        }

        // Process children
        node.childNodes.forEach((child) => processNode(child, result));
    }
}

/**
 * Captures simplified HTML representation of the current page
 * Only includes semantic elements and useful attributes
 * Returns undefined if called on non-web platforms or if capture fails
 */
function capturePageHTMLContext(): string | undefined {
    // Only works on web platform
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return undefined;
    }

    try {
        // Find main content area (exclude side panel and modals)
        const root = document.getElementById('root');
        if (!root) {
            return undefined;
        }

        const result: string[] = [];

        // Process all nodes in the main content
        processNode(root, result);

        // Remove duplicates (same elements appearing multiple times)
        const uniqueElements = Array.from(new Set(result));

        // Join all elements
        let htmlContent = uniqueElements.join('\n');

        // Truncate if exceeds size limit
        if (htmlContent.length > MAX_HTML_SIZE) {
            htmlContent = htmlContent.slice(0, MAX_HTML_SIZE) + '\n... [truncated]';
        }

        // Wrap with page URL
        const pageURL = window.location.pathname + window.location.search;
        return `<page url="${pageURL}">\n${htmlContent}\n</page>`;
    } catch (error) {
        // Fail silently, don't break the chat functionality
        console.warn('[PageContext] Failed to capture page HTML:', error);
        return undefined;
    }
}

export default {
    capturePageHTMLContext,
};
