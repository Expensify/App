import type {SetStateAction} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';

function useCarouselArrows() {
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const [shouldShowArrows, setShouldShowArrowsInternal] = useState(canUseTouchScreen);
    const autoHideArrowTimeout = useRef<NodeJS.Timeout | null>(null);

    /**
     * Cancels the automatic hiding of the arrows.
     */
    const cancelAutoHideArrows = useCallback(() => {
        if (!autoHideArrowTimeout.current) {
            return;
        }
        clearTimeout(autoHideArrowTimeout.current);
    }, []);

    /**
     * Automatically hide the arrows if there is no interaction for 3 seconds.
     */
    const autoHideArrows = useCallback(() => {
        if (!canUseTouchScreen) {
            return;
        }

        cancelAutoHideArrows();
        autoHideArrowTimeout.current = setTimeout(() => {
            setShouldShowArrowsInternal(false);
        }, CONST.ARROW_HIDE_DELAY);
    }, [canUseTouchScreen, cancelAutoHideArrows]);

    /**
     * Sets the visibility of the arrows.
     */
    const setShouldShowArrows = useCallback(
        (show: SetStateAction<boolean> = true) => {
            setShouldShowArrowsInternal(show);
            autoHideArrows();
        },
        [autoHideArrows],
    );

    useEffect(() => {
        autoHideArrows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows};
}

export default useCarouselArrows;
