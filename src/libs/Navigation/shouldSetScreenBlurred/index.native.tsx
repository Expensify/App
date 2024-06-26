/**
 * @param navigationIndex
 *
 * Decides whether to set screen to blurred state.
 *
 * If the screen is more than 1 screen away from the current screen, freeze it,
 * we don't want to freeze the screen if it's the previous screen because the freeze placeholder
 * would be visible at the beginning of the back animation then
 */
const shouldSetScreenBlurred = (navigationIndex: number) => navigationIndex > 1;

export default shouldSetScreenBlurred;
