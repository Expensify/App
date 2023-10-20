import React, {useMemo, useState, useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);
    const [volume, setVolume] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);

    const [currentVideoPlayerRef, setCurrentVideoPlayerRef] = useState(null);

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.setStatusAsync({shouldPlay: false});
        setIsPlaying(false);
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
        currentVideoPlayerRef.setStatusAsync({shouldPlay: true});
        setIsPlaying(true);
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

    const updateCurrentVideoPlayerRef = useCallback((ref) => {
        setCurrentVideoPlayerRef(ref);
    }, []);

    const updateVolume = useCallback(
        (newVolume) => {
            currentVideoPlayerRef.setStatusAsync({volume: newVolume});
            setVolume(newVolume);
        },
        [currentVideoPlayerRef],
    );

    const updateSharedElements = (parent, child) => {
        setOriginalParent(parent);
        setSharedElement(child);
    };

    const togglePlay = useCallback(() => {
        currentVideoPlayerRef.setStatusAsync({shouldPlay: !isPlaying});
        setIsPlaying(!isPlaying);
    }, [currentVideoPlayerRef, isPlaying]);

    const enterFullScreenMode = useCallback(() => {
        currentVideoPlayerRef.presentFullscreenPlayer();
    }, [currentVideoPlayerRef]);

    const updatePostiion = useCallback(
        (newPosition) => {
            currentVideoPlayerRef.setStatusAsync({positionMillis: newPosition});
        },
        [currentVideoPlayerRef],
    );

    // actions after videoRef is set
    useEffect(() => {
        if (currentVideoPlayerRef && !isPlaying) {
            playVideo();
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentVideoPlayerRef, playVideo]);

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            updateSharedElements,
            volume,
            updateVolume,
            togglePlay,
            isPlaying,
            enterFullScreenMode,
            updatePostiion,
            currentVideoPlayerRef,
            updateCurrentVideoPlayerRef,
        }),
        [
            currentVideoPlayerRef,
            currentlyPlayingURL,
            enterFullScreenMode,
            isPlaying,
            originalParent,
            sharedElement,
            togglePlay,
            updateCurrentVideoPlayerRef,
            updateCurrentlyPlayingURL,
            updatePostiion,
            updateVolume,
            volume,
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
