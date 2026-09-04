type DomUtils = {
    addCSS: (css: string, styleID: string) => void;
    getAutofilledInputStyle: (inputTextColor: string, cssSelector?: string) => string;
    getActiveElement: () => Element | null;
    requestAnimationFrame: (callback: () => void) => number | void;
};
type GetActiveElement = DomUtils['getActiveElement'];

export type {DomUtils};
export default GetActiveElement;
