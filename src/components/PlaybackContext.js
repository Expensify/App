import React, {useMemo, useState, useCallback} from 'react';
import PropTypes from 'prop-types';

const PlaybackContext = React.createContext(null);

function PlaybackContextProvider({children}) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState(null);
    const [sharedElement, setSharedElement] = useState(null);
    const [originalParent, setOriginalParent] = useState(null);
    const [volume, setVolume] = useState(0);

    const updateCurrentlyPlayingURL = useCallback((url) => {
        setCurrentlyPlayingURL(url);
    }, []);

    const updateVolume = useCallback((newVolume) => {
        setVolume(newVolume);
    }, []);

    const updateSharedElements = (parent, child) => {
        setOriginalParent(parent);
        setSharedElement(child);
    };

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            updateSharedElements,
            volume,
            updateVolume,
        }),
        [currentlyPlayingURL, originalParent, sharedElement, updateCurrentlyPlayingURL, updateVolume, volume],
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
