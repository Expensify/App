/** Extra space (px) left between a view the list scrolls to and the edge of the list's visible area */
const EXTRA_SCROLL_PADDING = 16;

type VerticalSpan = {
    /** Where the span starts, measured from the top of the window */
    top: number;

    /** How tall the span is */
    height: number;
};

/**
 * Returns how far the list has to scroll for the view to be in sight: negative to scroll up, 0 when it already is.
 * A view taller than the visible area is brought in by its bottom edge, where a form field shows its error.
 */
function getScrollDeltaToReveal(view: VerticalSpan, visibleArea: VerticalSpan): number {
    const visibleTop = visibleArea.top + EXTRA_SCROLL_PADDING;
    const visibleBottom = visibleArea.top + visibleArea.height - EXTRA_SCROLL_PADDING;
    const viewBottom = view.top + view.height;

    if (view.height > visibleBottom - visibleTop) {
        const isBottomInSight = viewBottom >= visibleTop && viewBottom <= visibleBottom;
        return isBottomInSight ? 0 : viewBottom - visibleBottom;
    }
    if (view.top < visibleTop) {
        return view.top - visibleTop;
    }
    return Math.max(0, viewBottom - visibleBottom);
}

export default getScrollDeltaToReveal;
export {EXTRA_SCROLL_PADDING};
