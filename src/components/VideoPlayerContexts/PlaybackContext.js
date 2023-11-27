import PropTypes from 'prop-types';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);
    const currentVideoPlayerRef = useRef(null);

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

    const shareVideoPlayerElements = useCallback(
        (ref, parent, child) => {
            currentVideoPlayerRef.current = ref;
            setOriginalParent(parent);
            setSharedElement(child);
            playVideo();
        },
        [playVideo],
    );

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            currentVideoPlayerRef,
            shareVideoPlayerElements,
            playVideo,
            pauseVideo,
        }),
        [updateCurrentlyPlayingURL, currentlyPlayingURL, originalParent, sharedElement, shareVideoPlayerElements, playVideo, pauseVideo],
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
