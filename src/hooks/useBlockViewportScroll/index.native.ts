/**
 * A hook that blocks viewport scroll when the keyboard is visible.
 * It does this by capturing the current scrollY position when the keyboard is shown, then scrolls back to this position smoothly on 'touchend' event.
 * This scroll blocking is removed when the keyboard hides.
 * This hook is doing nothing on native platforms.
 *
 * @example
 * useBlockViewportScroll();
 */
function useBlockViewportScroll() {
    // This hook is doing nothing on native platforms.
    // Check index.ts for web implementation.
}

export default useBlockViewportScroll;
