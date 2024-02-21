import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import {usePlaybackContext} from './PlaybackContext';

const VolumeContext = React.createContext(null);

function VolumeContextProvider({children}) {
    const {currentVideoPlayerRef, originalParent} = usePlaybackContext();
    const volume = useSharedValue(0);

    const updateVolume = useCallback(
        (newVolume) => {
            if (!currentVideoPlayerRef.current) {
                return;
            }
            currentVideoPlayerRef.current.setStatusAsync({volume: newVolume});
            volume.value = newVolume;
        },
        [currentVideoPlayerRef, volume],
    );

    // We want to update the volume when currently playing video changes.
    // When originalParent changed we're sure that currentVideoPlayerRef is updated. So we can apply the new volume.
    useEffect(() => {
        if (!originalParent) {
            return;
        }
        updateVolume(volume.value);
    }, [originalParent, updateVolume, volume.value]);

    const contextValue = useMemo(() => ({updateVolume, volume}), [updateVolume, volume]);
    return <VolumeContext.Provider value={contextValue}>{children}</VolumeContext.Provider>;
}

function useVolumeContext() {
    const context = useContext(VolumeContext);
    if (context === undefined) {
        throw new Error('useVolumeContext must be used within a VolumeContextProvider');
    }
    return context;
}

VolumeContextProvider.displayName = 'VolumeContextProvider';
VolumeContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export {VolumeContextProvider, useVolumeContext};
