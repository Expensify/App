import type FocusUtils from './types';

const focusUtils: FocusUtils = {
    isElementFocusRestorable: (_element): _element is HTMLElement => false,
    isFocusableActionableElement: (_element): _element is HTMLElement => false,
};

export default focusUtils;
