import {useCallback, useRef} from 'react';
import type {SetStateAction} from 'react';
import {useSharedValue} from 'react-native-reanimated';

function useCarouselContextEvents(setShouldShowArrows?: (show?: SetStateAction<boolean>) => void) {
    const scale = useRef(1);
    const isScrollEnabled = useSharedValue(true);

    /**
     * Toggles the arrows visibility
     */
    const onRequestToggleArrows = useCallback(
        (showArrows?: boolean) => {
            if (showArrows === undefined) {
                setShouldShowArrows?.((prevShouldShowArrows) => !prevShouldShowArrows);
                return;
            }

            setShouldShowArrows?.(showArrows);
        },
        [setShouldShowArrows],
    );

    /**
     * This callback is passed to the MultiGestureCanvas/Lightbox through the AttachmentCarouselPagerContext.
     * It is used to react to zooming/pinching and (mostly) enabling/disabling scrolling on the pager,
     * as well as enabling/disabling the carousel buttons.
     */
    const handleScaleChange = useCallback(
        (newScale: number) => {
            if (newScale === scale.current) {
                return;
            }

            scale.current = newScale;

            const newIsScrollEnabled = newScale === 1;
            if (isScrollEnabled.get() === newIsScrollEnabled) {
                return;
            }

            isScrollEnabled.set(newIsScrollEnabled);
            onRequestToggleArrows(newIsScrollEnabled);
        },
        [isScrollEnabled, onRequestToggleArrows],
    );

    /**
     * This callback is passed to the MultiGestureCanvas/Lightbox through the AttachmentCarouselPagerContext.
     * It is used to trigger touch events on the pager when the user taps on the MultiGestureCanvas/Lightbox.
     */
    const handleTap = useCallback(
        (shouldShowArrows?: boolean) => {
            if (!isScrollEnabled.get()) {
                return;
            }

            onRequestToggleArrows(shouldShowArrows);
        },
        [isScrollEnabled, onRequestToggleArrows],
    );

    return {handleTap, handleScaleChange, scale, isScrollEnabled};
}

export default useCarouselContextEvents;
