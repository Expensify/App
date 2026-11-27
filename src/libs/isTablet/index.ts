import TABLET_MIN_SCREEN_DIMENSION from './TABLET_MIN_SCREEN_DIMENSION';

/** Whether the device is a tablet, judged by the screen rather than the window so resizing or rotating doesn't change it. */
function isTablet(): boolean {
    return Math.min(window.screen.width, window.screen.height) >= TABLET_MIN_SCREEN_DIMENSION;
}

export default isTablet;
