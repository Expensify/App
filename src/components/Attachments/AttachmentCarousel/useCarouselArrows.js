import {useCallback, useEffect, useRef, useState} from 'react';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';

function useCarouselArrows() {
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const [shouldShowArrows, setShouldShowArrowsInternal] = useState(canUseTouchScreen);
    const autoHideArrowTimeout = useRef(null);

    /**
     * Cancels the automatic hiding of the arrows.
     */
    const cancelAutoHideArrows = useCallback(() => clearTimeout(autoHideArrowTimeout.current), []);

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

    const setShouldShowArrows = useCallback(
        (show = true) => {
            setShouldShowArrowsInternal(show);
            autoHideArrows();
        },
        [autoHideArrows],
    );

    useEffect(() => {
        autoHideArrows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows];
}

export default useCarouselArrows;
