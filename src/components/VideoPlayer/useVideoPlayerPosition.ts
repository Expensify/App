/** Keeps the controls at the requested seek position until the player reports it. */
import type {VideoPlayer} from 'expo-video';

import {useEvent, useEventListener} from 'expo';
import {useState} from 'react';

const SEEK_POSITION_TOLERANCE_SECONDS = 0.5;

function useVideoPlayerPosition(player: VideoPlayer) {
    const [seekTargetPosition, setSeekTargetPosition] = useState<number | null>(null);
    const {currentTime} = useEvent(player, 'timeUpdate', {currentTime: 0, bufferedPosition: 0, currentLiveTimestamp: null, currentOffsetFromLive: null});

    useEventListener(player, 'timeUpdate', (event) => {
        // A delayed pre-seek update must not restore the old position when the drag ends.
        setSeekTargetPosition((target) => (target !== null && Math.abs(event.currentTime - target) <= SEEK_POSITION_TOLERANCE_SECONDS ? null : target));
    });

    useEventListener(player, 'playToEnd', () => {
        setSeekTargetPosition(null);
    });

    useEventListener(player, 'sourceLoad', () => {
        setSeekTargetPosition(null);
    });

    return {currentTime, position: seekTargetPosition ?? currentTime, setSeekTargetPosition};
}

export default useVideoPlayerPosition;
