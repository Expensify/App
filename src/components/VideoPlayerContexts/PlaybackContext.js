import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useRef, useState} from 'react';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const playbackSpeeds = useMemo(() => [0.25, 0.5, 1, 1.5, 2], []);
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(playbackSpeeds[2]);

    const currentVideoPlayerRef = useRef(null);

    const updateIsPlaying = useCallback((isVideoPlaying) => {
        setIsPlaying(isVideoPlaying);
    }, []);

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: true});
    }, [currentVideoPlayerRef]);

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

    const togglePlay = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: !isPlaying});
        setIsPlaying(!isPlaying);
    }, [currentVideoPlayerRef, isPlaying]);

    const enterFullScreenMode = useCallback(() => {
        currentVideoPlayerRef.current.presentFullscreenPlayer();
    }, [currentVideoPlayerRef]);

    const seekPosition = useCallback(
        (newPosition) => {
            currentVideoPlayerRef.current.setStatusAsync({positionMillis: newPosition});
        },
        [currentVideoPlayerRef],
    );

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
            enterFullScreenMode,
            currentVideoPlayerRef,
            updateCurrentVideoPlayerRef,
            seekPosition,
            playVideo,
            pauseVideo,
            playbackSpeeds,
            updatePlaybackSpeed,
            currentPlaybackSpeed,
            updateIsPlaying,
        }),
        [
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            updateSharedElements,
            togglePlay,
            isPlaying,
            enterFullScreenMode,
            updateCurrentVideoPlayerRef,
            seekPosition,
            playVideo,
            pauseVideo,
            playbackSpeeds,
            updatePlaybackSpeed,
            currentPlaybackSpeed,
            updateIsPlaying,
        ],
    );
    return <PlaybackContext.Provider value={contextValue}>{children}</PlaybackContext.Provider>;
}

function usePlaybackContext() {
    const context = React.useContext(PlaybackContext);
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
