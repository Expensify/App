// react-window's outer div, which react-fast-pdf makes focusable with tabIndex=-1. Matching it as a direct child of
// react-pdf's Document keeps other tabIndex=-1 elements, like the password input wrapper, from matching.
const PDF_SCROLLER_SELECTOR = '.react-pdf__Document > [tabindex="-1"]';

/**
 * Focuses the PDF scroller inside the container so arrow keys scroll the PDF. It takes focus only from the body or
 * from elsewhere inside the container. The scroller renders only after the PDF loads (and is unlocked, for
 * password-protected PDFs), so it keeps watching the container until the scroller appears.
 *
 * The scroller is a plain div, so screen readers announce it only as "group". It is named with the given label so
 * they announce which PDF is focused.
 *
 * @returns a cleanup function that stops watching the container
 */
function focusPDFScrollerWhenReady(container: HTMLElement, accessibilityLabel: string): () => void {
    const focusPDFScroller = () => {
        const scroller = container.querySelector<HTMLElement>(PDF_SCROLLER_SELECTOR);
        if (!scroller) {
            return false;
        }

        // A generic div can't carry an accessible name, so give it the group role screen readers already announce
        scroller.setAttribute('role', 'group');
        scroller.setAttribute('aria-label', accessibilityLabel);

        const activeElement = document.activeElement;
        const isFocusAvailable = !activeElement || activeElement === document.body || (container.contains(activeElement) && !scroller.contains(activeElement));
        if (isFocusAvailable) {
            scroller.focus({preventScroll: true});
        }
        return true;
    };

    if (focusPDFScroller()) {
        return () => {};
    }

    const observer = new MutationObserver(() => {
        if (!focusPDFScroller()) {
            return;
        }
        observer.disconnect();
    });
    observer.observe(container, {childList: true, subtree: true});

    return () => observer.disconnect();
}

export default focusPDFScrollerWhenReady;
