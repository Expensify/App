import React, {useMemo, useState, useCallback, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);
    const [volume, setVolume] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);

    const currentVideoPLayerRef = useRef(null);

    const pauseVideo = useCallback(() => {
        currentVideoPLayerRef.current.setStatusAsync({shouldPlay: false});
        setIsPlaying(false);
    }, []);

    const playVideo = useCallback(() => {
        currentVideoPLayerRef.current.setStatusAsync({shouldPlay: true});
        setIsPlaying(true);
    }, []);

    const updateCurrentlyPlayingURL = useCallback(
        (url) => {
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, pauseVideo],
    );

    const updateVolume = useCallback((newVolume) => {
        currentVideoPLayerRef.current.setStatusAsync({volume: newVolume});
        setVolume(newVolume);
    }, []);

    const updateSharedElements = (parent, child) => {
        setOriginalParent(parent);
        setSharedElement(child);
    };

    const togglePlay = useCallback(() => {
        currentVideoPLayerRef.current.setStatusAsync({shouldPlay: !isPlaying});
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const enterFullScreenMode = () => {
        currentVideoPLayerRef.current.presentFullscreenPlayer();
    };

    const updatePostiion = (newPosition) => {
        currentVideoPLayerRef.current.setStatusAsync({positionMillis: newPosition});
    };

    useEffect(() => {
        if (currentVideoPLayerRef.current && !isPlaying) {
            playVideo();
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentVideoPLayerRef.current, playVideo]);

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            updateSharedElements,
            volume,
            updateVolume,
            currentVideoPLayerRef,
            togglePlay,
            isPlaying,
            enterFullScreenMode,
            updatePostiion,
        }),
        [currentlyPlayingURL, isPlaying, originalParent, sharedElement, togglePlay, updateCurrentlyPlayingURL, updateVolume, volume],
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
