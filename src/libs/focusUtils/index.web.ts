import CONST from '@src/CONST';
import type FocusUtils from './types';

function hasFocusBlockingAttributes(element: HTMLElement): boolean {
    return element.hasAttribute('disabled') || element.hasAttribute('inert') || !!element.closest('[inert]');
}

const focusUtils: FocusUtils = {
    isElementFocusRestorable: (element): element is HTMLElement => {
        if (!(element instanceof HTMLElement) || element === document.body || element === document.documentElement || !document.body.contains(element)) {
            return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }

        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            return false;
        }

        return !hasFocusBlockingAttributes(element);
    },

    isFocusableActionableElement: (element): element is HTMLElement => {
        if (!(element instanceof HTMLElement)) {
            return false;
        }

        const role = element.getAttribute('role');
        if (role !== CONST.ROLE.BUTTON && role !== CONST.ROLE.MENUITEM) {
            return false;
        }

        if (element.tabIndex < 0 || element.getAttribute('aria-disabled') === 'true') {
            return false;
        }

        return !hasFocusBlockingAttributes(element);
    },
};

export default focusUtils;
