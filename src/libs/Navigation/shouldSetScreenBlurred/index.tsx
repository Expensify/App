/**
 * @param navigationIndex
 *
 * Decides whether to set screen to blurred state.
 *
 * Allow freezing the first screen and more in the stack only on
 * web and desktop platforms. The reason is that in the case of
 * LHN, we have FlashList rendering in the back while we are on
 * Settings screen.
 */
const shouldSetScreenBlurred = (navigationIndex: number) => navigationIndex > 1;

export default shouldSetScreenBlurred;
