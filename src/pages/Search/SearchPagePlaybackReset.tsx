import {useEffect} from 'react';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';

function SearchPagePlaybackReset() {
    const {resetVideoPlayerData} = usePlaybackActionsContext();

    useEffect(() => {
        resetVideoPlayerData();

        return () => {
            resetVideoPlayerData();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- This effect should only reset playback when the wide search branch mounts or unmounts.
    }, []);

    return null;
}

export default SearchPagePlaybackReset;
