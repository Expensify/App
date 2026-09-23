/** The part of a list ref this hook needs: a handle to the element that actually scrolls. */
type ScrollableNodeHolder = {
    getScrollableNode: () => unknown;
};

type VerticalScrollbarWidth = {
    /** How much width the list's vertical scrollbar takes from its content. 0 when the platform overlays the bar. */
    scrollbarWidth: number;

    /** Attach to the list's `ref` so the measurement follows the element that scrolls. */
    measureScrollbarRef: (instance: ScrollableNodeHolder | null) => void;
};

type UseVerticalScrollbarWidth = () => VerticalScrollbarWidth;

export type {ScrollableNodeHolder, VerticalScrollbarWidth};

export default UseVerticalScrollbarWidth;
