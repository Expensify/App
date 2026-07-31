/** True when `el` is visible to the user: not under any `display: none` ancestor and not `visibility: hidden` itself. */
function isEffectivelyVisible(el: HTMLElement): boolean {
    if (typeof window === 'undefined') {
        return true;
    }
    // `display` is element-self only — walk ancestors. `visibility` is inherited — self-check suffices.
    for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
        if (window.getComputedStyle(node).display === 'none') {
            return false;
        }
    }
    return window.getComputedStyle(el).visibility !== 'hidden';
}

export default isEffectivelyVisible;
