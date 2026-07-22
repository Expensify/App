/** Typed guard. `typeof HTMLElement` covers stock native; the `getAttribute` duck-type covers HybridApp builds that expose `HTMLElement` but whose native View lacks DOM methods. */
function isHTMLElement(value: unknown): value is HTMLElement {
    return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement && typeof value.getAttribute === 'function';
}

export default isHTMLElement;
