import React, {useCallback, useContext, useEffect} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackStateContext} from './PlaybackContext';
import type {VolumeActionsContextType, VolumeStateContextType} from './types';

const VolumeStateContext = React.createContext<VolumeStateContextType | null>(null);
const VolumeActionsContext = React.createContext<VolumeActionsContextType | null>(null);

function VolumeContextProvider({children}: ChildrenProps) {
    const {currentVideoPlayerRef, originalParent} = usePlaybackStateContext();
    const volume = useSharedValue(0);
    // We need this field to remember the last value before clicking mute
    const lastNonZeroVolume = useSharedValue(1);

    const updateVolume = useCallback(
        (newVolume: number) => {
            if (!currentVideoPlayerRef.current) {
                return;
            }
            currentVideoPlayerRef.current.volume = newVolume;
            currentVideoPlayerRef.current.muted = newVolume === 0;

            volume.set(newVolume);
        },
        [currentVideoPlayerRef, volume],
    );

    // This function ensures mute and unmute functionality. Overwriting lastNonZeroValue
    // only in the case of mute guarantees that a pan gesture reducing the volume to zero won't cause
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

    const stateValue = {volume, lastNonZeroVolume};
    const actionsValue = {updateVolume, toggleMute};

    return (
        <VolumeStateContext.Provider value={stateValue}>
            <VolumeActionsContext.Provider value={actionsValue}>{children}</VolumeActionsContext.Provider>
        </VolumeStateContext.Provider>
    );
}

function useVolumeState() {
    const context = useContext(VolumeStateContext);
    if (!context) {
        throw new Error('useVolumeState must be used within a VolumeContextProvider');
    }
    return context;
}

function useVolumeActions() {
    const context = useContext(VolumeActionsContext);
    if (!context) {
        throw new Error('useVolumeActions must be used within a VolumeContextProvider');
    }
    return context;
}

function useVolumeContext() {
    const state = useVolumeState();
    const actions = useVolumeActions();
    return {...state, ...actions};
}

export {VolumeContextProvider, useVolumeContext, useVolumeState, useVolumeActions};
