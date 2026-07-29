import isHTMLElement from './isHTMLElement';

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'password', 'tel', 'url', 'number', 'date', 'datetime-local', 'month', 'time', 'week']);
const BUTTON_INPUT_TYPES = new Set(['button', 'submit', 'reset', 'image']);
const INTERACTIVE_TAGS = new Set(['BUTTON', 'SELECT']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'tab', 'switch', 'option', 'row', 'gridcell', 'treeitem', 'searchbox', 'combobox']);

type ActivationKey = 'Enter' | 'Space';

/** Native tags or ARIA roles that make an element user-activatable regardless of tab order. `<a>` needs an `href` to count. */
function isInteractive(el: HTMLElement): boolean {
    if (INTERACTIVE_TAGS.has(el.tagName)) {
        return true;
    }
    if (el.tagName === 'A' && el.hasAttribute('href')) {
        return true;
    }
    const role = el.getAttribute('role');
    return role !== null && INTERACTIVE_ROLES.has(role);
}

/**
 * True when this key would activate a control, not type text. Text `<input>`s accept Enter only (form submit); `<textarea>`/`[contenteditable]` reject both; other `<input>`s activate only when button-like. Everything else requires interactive semantics.
 * `hasFocusableAttributes` runs alongside for `:disabled` / `aria-disabled` / `aria-hidden` / `[inert]`.
 */
function isActivatableTarget(el: Element, key: ActivationKey): el is HTMLElement {
    if (!isHTMLElement(el)) {
        return false;
    }
    if (el instanceof HTMLTextAreaElement) {
        return false;
    }
    if (el instanceof HTMLInputElement) {
        if (TEXT_INPUT_TYPES.has(el.type)) {
            return key === 'Enter';
        }
        return BUTTON_INPUT_TYPES.has(el.type);
    }
    // Attribute fallback for environments where `isContentEditable` isn't implemented (jsdom).
    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true' || el.getAttribute('contenteditable') === '') {
        return false;
    }
    return isInteractive(el);
}

export default isActivatableTarget;
