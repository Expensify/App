/** Shortest side of the screen, in pixels, from which a mobile browser is treated as a tablet */
const TABLET_MIN_SCREEN_DIMENSION = 600;

/** Whether the device is a tablet, judged by the screen rather than the window so resizing or rotating doesn't change it. */
function isTablet(): boolean {
    return Math.min(window.screen.width, window.screen.height) >= TABLET_MIN_SCREEN_DIMENSION;
}

export default isTablet;
