import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useIsSoftKeyboardOpen from '@hooks/useIsSoftKeyboardOpen';

import {useEffect} from 'react';

/**
 * Whether a fixed header should give up its layout space while the soft keyboard is open.
 *
 * Mobile web in landscape leaves roughly 180pt of viewport once the keyboard is up, and a header is 72pt of it.
 * Both browsers end up with the focused input unreachable, for different reasons: Chrome honours
 * `interactive-widget=resizes-content` from `web/index.html` and shrinks the layout viewport, so the header and any
 * fixed footer squeeze the flexing content down to a sliver the browser can only scroll the input into; Safari leaves
 * the layout viewport alone and scrolls the visual one instead, which ScreenWrapperContainer deliberately cancels out
 * with `marginTop: viewportOffsetTop` and useTackInputFocus. Neither can be fixed by scrolling — the space has to come
 * from somewhere, so the header yields it for as long as the keyboard needs it.
 *
 * `isInLandscapeMode` is already false on desktop browsers and tablets (see @libs/isInLandscapeMode), so this is
 * effectively "mobile web phone, in landscape, with the keyboard up".
 */
function useShouldHideHeaderForKeyboard(): boolean {
    const isInLandscapeMode = useIsInLandscapeMode();
    const isSoftKeyboardOpen = useIsSoftKeyboardOpen(isInLandscapeMode);
    const shouldHideHeader = isInLandscapeMode && isSoftKeyboardOpen;

    useEffect(() => {
        if (!shouldHideHeader) {
            return;
        }

        // The browser scrolled the input into view on focus, against a layout that still had the header in it, so the
        // reveal has to be redone now that it is gone. A frame is enough for the taller content box to settle.
        const frameID = requestAnimationFrame(() => {
            const activeElement = document.activeElement;

            if (!(activeElement instanceof HTMLElement)) {
                return;
            }

            activeElement.scrollIntoView({block: 'nearest'});
        });

        return () => cancelAnimationFrame(frameID);
    }, [shouldHideHeader]);

    return shouldHideHeader;
}

export default useShouldHideHeaderForKeyboard;
