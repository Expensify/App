import useIsInLandscapeMode from './useIsInLandscapeMode';
import useKeyboardState from './useKeyboardState';

/**
 * A screen that renders a selection list usually shows its confirm button as the list footer. In landscape mode the open
 * keyboard leaves very little vertical space, so a footer fixed to the bottom eats most of what is left for the list.
 * In that case the footer is moved into the list, so it scrolls with the data instead.
 */
function useShouldFooterBeInsideList(): boolean {
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardActive} = useKeyboardState();

    return isInLandscapeMode && isKeyboardActive;
}

export default useShouldFooterBeInsideList;
