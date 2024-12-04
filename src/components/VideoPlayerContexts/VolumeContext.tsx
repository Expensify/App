import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackContext} from './PlaybackContext';
import type {VolumeContext} from './types';

const Context = React.createContext<VolumeContext | null>(null);

function VolumeContextProvider({children}: ChildrenProps) {
    const {currentVideoPlayerRef, originalParent} = usePlaybackContext();
    const volume = useSharedValue(0);
    const lastNonZeroVolume = useSharedValue(1);

    const updateVolume = useCallback(
        (newVolume: number | ((actualValue: number) => number)) => {
            if (!currentVideoPlayerRef.current) {
                return;
            }
            const volumeValue = typeof newVolume === 'function' ? newVolume(volume.get()) : newVolume;

            currentVideoPlayerRef.current.setStatusAsync({
                volume: volumeValue,
                isMuted: volumeValue === 0,
            });

            volume.set((value: number) => {
                if (value !== 0) {
                    lastNonZeroVolume.set(value);
                }
                return volumeValue;
            });
        },
        [currentVideoPlayerRef, volume],
    );
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
        }),
        [updateVolume, volume, lastNonZeroVolume],
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

VolumeContextProvider.displayName = 'VolumeContextProvider';

export {VolumeContextProvider, useVolumeContext};
