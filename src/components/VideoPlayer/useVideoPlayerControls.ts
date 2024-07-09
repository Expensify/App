import type {SetStateAction} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';

function useVideoPlayerControls() {
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const [shouldShowVideoPlayerControls, setShouldShowVideoPlayerControlsInternal] = useState(canUseTouchScreen);
    const autoHideVideoPlayerControlTimeout = useRef<NodeJS.Timeout | null>(null);

    /**
     * Cancels the automatic hiding of the video player control.
     */
    const cancelAutoHideVideoPlayerControls = useCallback(() => {
        if (!autoHideVideoPlayerControlTimeout.current) {
            return;
        }
        clearTimeout(autoHideVideoPlayerControlTimeout.current);
    }, []);

    /**
     * Automatically hide the video player control if there is no interaction for 3 seconds.
     */
    const autoHideVideoPlayerControls = useCallback(() => {
        if (!canUseTouchScreen) {
            return;
        }

        cancelAutoHideVideoPlayerControls();
        autoHideVideoPlayerControlTimeout.current = setTimeout(() => {
            setShouldShowVideoPlayerControlsInternal(false);
        }, CONST.VIDEO_PLAYER_CONTROL_HIDE_DELAY);
    }, [canUseTouchScreen, cancelAutoHideVideoPlayerControls]);

    /**
     * Sets the visibility of the video player control.
     */
    const setShouldShowVideoPlayerControls = useCallback(
        (show: SetStateAction<boolean> = true) => {
            setShouldShowVideoPlayerControlsInternal(show);
            autoHideVideoPlayerControls();
        },
        [autoHideVideoPlayerControls],
    );

    useEffect(() => {
        autoHideVideoPlayerControls();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return {shouldShowVideoPlayerControls, setShouldShowVideoPlayerControls, autoHideVideoPlayerControls, cancelAutoHideVideoPlayerControls};
}

export default useVideoPlayerControls;
