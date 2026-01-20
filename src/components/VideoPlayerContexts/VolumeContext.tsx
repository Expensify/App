import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackContext} from './PlaybackContext';
import type {VolumeContext} from './types';

const Context = React.createContext<VolumeContext | null>(null);

function VolumeContextProvider({children}: ChildrenProps) {
    const {currentVideoPlayerRef, originalParent} = usePlaybackContext();
    const volume = useSharedValue(0);
    // We need this field to remember the last value before clicking mute
    const lastNonZeroVolume = useSharedValue(1);

    const updateVolume = useCallback(
        (newVolume: number) => {
            if (!currentVideoPlayerRef.current) {
                return;
            }
            currentVideoPlayerRef.current.setStatusAsync({volume: newVolume, isMuted: newVolume === 0});

            volume.set(newVolume);
        },
        [currentVideoPlayerRef, volume],
    );

    // This function ensures mute and unmute functionality. Overwriting lastNonZeroValue
    // only in the case of mute guarantees that a pan gesture reducing the volume to zero won’t cause
    // us to lose this value. As a result, unmute restores the last non-zero value.
    const toggleMute = useCallback(() => {
        if (volume.get() !== 0) {
            lastNonZeroVolume.set(volume.get());
        }
        updateVolume(volume.get() === 0 ? lastNonZeroVolume.get() : 0);
    }, [lastNonZeroVolume, updateVolume, volume]);

    // We want to update the volume when currently playing video changes.
    // When originalParent changed we're sure that currentVideoPlayerRef is updated. So we can apply the new volume.
    useEffect(() => {
        if (!originalParent) {
            return;
        }
        updateVolume(volume.get());
    }, [originalParent, updateVolume, volume]);

    const contextValue = useMemo(
        () => ({
            updateVolume,
            volume,
            lastNonZeroVolume,
            toggleMute,
        }),
        [updateVolume, volume, lastNonZeroVolume, toggleMute],
    );

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useVolumeContext() {
    const volumeContext = useContext(Context);
    if (!volumeContext) {
        throw new Error('useVolumeContext must be used within a VolumeContextProvider');
    }
    return volumeContext;
}

export {VolumeContextProvider, useVolumeContext};
