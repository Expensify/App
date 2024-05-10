/**
 * @param navigationIndex
 *
 * Decides whether to set screen to blurred state
 */
const shouldSetScreenBlurred = (navigationIndex: number) => navigationIndex >= 1;

export default shouldSetScreenBlurred;
