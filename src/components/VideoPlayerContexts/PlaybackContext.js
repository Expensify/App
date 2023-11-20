import PropTypes from 'prop-types';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import CONST from '@src/CONST';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);
    const currentVideoPlayerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const playbackSpeeds = CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS;
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(playbackSpeeds[2]);

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: true});
    }, [currentVideoPlayerRef]);

    const togglePlay = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: !isPlaying});
        setIsPlaying(!isPlaying);
    }, [currentVideoPlayerRef, isPlaying]);

    const updateCurrentlyPlayingURL = useCallback(
        (url) => {
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, pauseVideo],
    );

    const updateCurrentVideoPlayerRef = useCallback(
        (ref) => {
            currentVideoPlayerRef.current = ref;
            playVideo();
        },
        [playVideo],
    );

    const updateSharedElements = useCallback((parent, child) => {
        setOriginalParent(parent);
        setSharedElement(child);
    }, []);

    const updatePlaybackSpeed = useCallback((newPlaybackSpeed) => {
        currentVideoPlayerRef.current.setStatusAsync({rate: newPlaybackSpeed});
        setCurrentPlaybackSpeed(newPlaybackSpeed);
    }, []);

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            updateSharedElements,
            togglePlay,
            isPlaying,
            currentVideoPlayerRef,
            updateCurrentVideoPlayerRef,
            playVideo,
            pauseVideo,
            playbackSpeeds,
            updatePlaybackSpeed,
            currentPlaybackSpeed,
            updateIsPlaying: setIsPlaying,
        }),
        [
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            updateSharedElements,
            togglePlay,
            isPlaying,
            updateCurrentVideoPlayerRef,
            playVideo,
            pauseVideo,
            playbackSpeeds,
            updatePlaybackSpeed,
            currentPlaybackSpeed,
            setIsPlaying,
        ],
    );
    return <PlaybackContext.Provider value={contextValue}>{children}</PlaybackContext.Provider>;
}

function usePlaybackContext() {
    const context = useContext(PlaybackContext);
    if (context === undefined) {
        throw new Error('usePlaybackContext must be used within a PlaybackContextProvider');
    }
    return context;
}

PlaybackContextProvider.displayName = 'EnvironmentProvider';
PlaybackContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export {PlaybackContextProvider, usePlaybackContext};
