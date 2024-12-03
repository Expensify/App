import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackContext} from './PlaybackContext';
import type {VolumeContext} from './types';

const Context = React.createContext<VolumeContext | null>(null);

function VolumeContextProvider({children}: ChildrenProps) {
    const {currentVideoPlayerRef, originalParent} = usePlaybackContext();
    const volume = useSharedValue(0);

    const updateVolume = useCallback(
        (newVolume: number) => {
            if (!currentVideoPlayerRef.current) {
                return;
            }
            currentVideoPlayerRef.current.setStatusAsync({volume: newVolume, isMuted: newVolume === 0});
            // eslint-disable-next-line react-compiler/react-compiler
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
