/** Typed guard. `typeof HTMLElement` check keeps it safe on native, where the global is undefined. */
function isHTMLElement(value: unknown): value is HTMLElement {
    return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
}

export default isHTMLElement;
