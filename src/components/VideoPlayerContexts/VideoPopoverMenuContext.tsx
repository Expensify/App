import type {VideoPlayer} from 'expo-video';
import React, {use, useEffect, useRef, useState} from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import useLocalize from '@hooks/useLocalize';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackStateContext} from './PlaybackContext';
import type {PlaybackSpeed, VideoPopoverMenuActionsContextType, VideoPopoverMenuStateContextType} from './types';

const VideoPopoverMenuStateContext = React.createContext<VideoPopoverMenuStateContextType | null>(null);
const VideoPopoverMenuActionsContext = React.createContext<VideoPopoverMenuActionsContextType | null>(null);

function VideoPopoverMenuContextProvider({children}: ChildrenProps) {
    const {translate} = useLocalize();
    const {currentVideoPlayerRef, originalParent} = usePlaybackStateContext();
    const [source, setSource] = useState('');
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<PlaybackSpeed>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[3]);
    const isLocalFile = !!source && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => source.startsWith(prefix));
    const videoPopoverMenuPlayerRef = useRef<VideoPlayer>(null);
    const session = useSession();
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    const updatePlaybackSpeed = (speed: PlaybackSpeed) => {
        setCurrentPlaybackSpeed(speed);

        // Setting the playback rate on iOS can resume playback if it was paused, so skip when already set.
        if (!videoPopoverMenuPlayerRef.current || videoPopoverMenuPlayerRef.current.playbackRate === speed) {
            return;
        }
        videoPopoverMenuPlayerRef.current.playbackRate = speed;
    };

    // Apply stored playback speed when the active player changes (e.g. navigating from parent to thread).
    // Same pattern as VolumeContext which re-applies volume on originalParent change.
    useEffect(() => {
        if (!originalParent || !currentVideoPlayerRef.current) {
            return;
        }

        if (currentVideoPlayerRef.current.playbackRate !== currentPlaybackSpeed) {
            currentVideoPlayerRef.current.playbackRate = currentPlaybackSpeed;
        }
    }, [originalParent, currentPlaybackSpeed, currentVideoPlayerRef]);

    const updateVideoPopoverMenuPlayerRef = (videoPlayer: VideoPlayer | null) => {
        videoPopoverMenuPlayerRef.current = videoPlayer;
    };

    const downloadAttachment = () => {
        if (typeof source === 'number' || !source) {
            return;
        }
        fileDownload(translate, addEncryptedAuthTokenToURL(source, encryptedAuthToken));
    };

    const stateValue = {currentPlaybackSpeed, isLocalFile};
    const actionsValue = {
        updateVideoPopoverMenuPlayerRef,
        updatePlaybackSpeed,
        updateSource: setSource,
        downloadAttachment,
    };

    return (
        <VideoPopoverMenuStateContext.Provider value={stateValue}>
            <VideoPopoverMenuActionsContext.Provider value={actionsValue}>{children}</VideoPopoverMenuActionsContext.Provider>
        </VideoPopoverMenuStateContext.Provider>
    );
}

function useVideoPopoverMenuState() {
    const context = use(VideoPopoverMenuStateContext);
    if (!context) {
        throw new Error('useVideoPopoverMenuState must be used within a VideoPopoverMenuContextProvider');
    }
    return context;
}

function useVideoPopoverMenuActions() {
    const context = use(VideoPopoverMenuActionsContext);
    if (!context) {
        throw new Error('useVideoPopoverMenuActions must be used within a VideoPopoverMenuContextProvider');
    }
    return context;
}

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuState, useVideoPopoverMenuActions};
