import React, {useMemo, useState, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const currentVideoPlayerRef = useRef(null);

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: false});
        setIsPlaying(false);
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: true});
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

    const updateCurrentVideoPlayerRef = useCallback(
        (ref) => {
            currentVideoPlayerRef.current = ref;
            playVideo();
        },
        [playVideo],
    );

    const updateSharedElements = (parent, child) => {
        setOriginalParent(parent);
        setSharedElement(child);
    };

    const togglePlay = useCallback(() => {
        currentVideoPlayerRef.current.setStatusAsync({shouldPlay: !isPlaying});
        setIsPlaying(!isPlaying);
    }, [currentVideoPlayerRef, isPlaying]);

    const enterFullScreenMode = useCallback(() => {
        currentVideoPlayerRef.current.presentFullscreenPlayer();
    }, [currentVideoPlayerRef]);

    const updatePostiion = useCallback(
        (newPosition) => {
            currentVideoPlayerRef.current.setStatusAsync({positionMillis: newPosition});
        },
        [currentVideoPlayerRef],
    );

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
