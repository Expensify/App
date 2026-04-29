import type {VideoPlayer} from 'expo-video';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackStateContext} from './PlaybackContext';
import type {PlaybackSpeed, VideoPopoverMenuActionsContextType, VideoPopoverMenuStateContextType} from './types';

const VideoPopoverMenuStateContext = React.createContext<VideoPopoverMenuStateContextType | null>(null);
const VideoPopoverMenuActionsContext = React.createContext<VideoPopoverMenuActionsContextType | null>(null);

function VideoPopoverMenuContextProvider({children}: ChildrenProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Download', 'Meter']);
    const {translate} = useLocalize();
    const {currentVideoPlayerRef, originalParent} = usePlaybackStateContext();
    const [source, setSource] = useState('');
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<PlaybackSpeed>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[3]);
    const {isOffline} = useNetwork();
    const isLocalFile = source && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => source.startsWith(prefix));
    const videoPopoverMenuPlayerRef = useRef<VideoPlayer>(null);
    const session = useSession();
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    const updatePlaybackSpeed = useCallback(
        (speed: PlaybackSpeed) => {
            setCurrentPlaybackSpeed(speed);

            // We check if the player ref exists and if the playback rate is already set to the new speed to avoid redundant updates.
            // On iOS, setting the playback rate can cause the video to resume playback if it was paused.
            if (!videoPopoverMenuPlayerRef.current || videoPopoverMenuPlayerRef.current.playbackRate === speed) {
                return;
            }
            videoPopoverMenuPlayerRef.current.playbackRate = speed;
        },
        [videoPopoverMenuPlayerRef],
    );

    // Apply stored playback speed when the active player changes (e.g. navigating from parent to thread).
    // Same pattern as VolumeContext which re-applies volume on originalParent change.
    useEffect(() => {
        if (!originalParent || !currentVideoPlayerRef.current) {
            return;
        }

        if (currentVideoPlayerRef.current.playbackRate !== currentPlaybackSpeed) {
            currentVideoPlayerRef.current.playbackRate = currentPlaybackSpeed;
        }
    }, [originalParent, currentPlaybackSpeed]);

    const updateVideoPopoverMenuPlayerRef = (videoPlayer: VideoPlayer | null) => {
        videoPopoverMenuPlayerRef.current = videoPlayer;
    };

    const downloadAttachment = useCallback(() => {
        if (typeof source === 'number' || !source) {
            return;
        }
        fileDownload(translate, addEncryptedAuthTokenToURL(source, encryptedAuthToken));
    }, [source, translate, encryptedAuthToken]);

    const menuItems = useMemo(() => {
        const items: PopoverMenuItem[] = [];

        if (!isOffline && !isLocalFile) {
            items.push({
                icon: icons.Download,
                text: translate('common.download'),
                onSelected: () => {
                    downloadAttachment();
                },
            });
        }

        items.push({
            icon: icons.Meter,
            text: translate('videoPlayer.playbackSpeed'),
            subMenuItems: CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS.map((speed) => ({
                icon: currentPlaybackSpeed === speed ? icons.Checkmark : undefined,
                text: speed === 1 ? translate('videoPlayer.normal') : speed.toString(),
                onSelected: () => {
                    updatePlaybackSpeed(speed);
                },
                shouldPutLeftPaddingWhenNoIcon: true,
                isSelected: currentPlaybackSpeed === speed,
            })),
        });
        return items;
    }, [icons.Checkmark, icons.Download, icons.Meter, currentPlaybackSpeed, downloadAttachment, translate, updatePlaybackSpeed, isOffline, isLocalFile]);

    const stateValue = {menuItems};
    const actionsValue = {updateVideoPopoverMenuPlayerRef, updatePlaybackSpeed, updateSource: setSource};

    return (
        <VideoPopoverMenuStateContext.Provider value={stateValue}>
            <VideoPopoverMenuActionsContext.Provider value={actionsValue}>{children}</VideoPopoverMenuActionsContext.Provider>
        </VideoPopoverMenuStateContext.Provider>
    );
}

function useVideoPopoverMenuState() {
    const context = useContext(VideoPopoverMenuStateContext);
    if (!context) {
        throw new Error('useVideoPopoverMenuState must be used within a VideoPopoverMenuContextProvider');
    }
    return context;
}

function useVideoPopoverMenuActions() {
    const context = useContext(VideoPopoverMenuActionsContext);
    if (!context) {
        throw new Error('useVideoPopoverMenuActions must be used within a VideoPopoverMenuContextProvider');
    }
    return context;
}

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuState, useVideoPopoverMenuActions};
