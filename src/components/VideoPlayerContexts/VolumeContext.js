import PropTypes from 'prop-types';
import React, {useCallback, useContext, useMemo} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import {usePlaybackContext} from './PlaybackContext';

const VolumeContext = React.createContext(null);

function VolumeContextProvider({children}) {
    const {currentVideoPlayerRef} = usePlaybackContext();
    const volume = useSharedValue(0);

    const updateVolume = useCallback(
        (newVolume) => {
            currentVideoPlayerRef.current.setStatusAsync({volume: newVolume});
            volume.value = newVolume;
        },
        [currentVideoPlayerRef, volume],
    );

    const contextValue = useMemo(() => ({updateVolume, volume}), [updateVolume, volume]);
    return <VolumeContext.Provider value={contextValue}>{children}</VolumeContext.Provider>;
}

function useVolumeContext() {
    const context = useContext(VolumeContext);
    if (context === undefined) {
        throw new Error('useVolumeContext must be used within a PlaybackContextProvider');
    }
    return context;
}

VolumeContextProvider.displayName = 'EnvironmentProvider';
VolumeContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export {VolumeContextProvider, useVolumeContext};
