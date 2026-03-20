type FocusUtils = {
    isElementFocusRestorable: (element: Element | null) => element is HTMLElement;
    isFocusableActionableElement: (element: Element) => element is HTMLElement;
};

export default FocusUtils;
