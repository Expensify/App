import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {usePlaybackContext} from './PlaybackContext';
import type {PlaybackSpeed, VideoPopoverMenuContext} from './types';

const Context = React.createContext<VideoPopoverMenuContext | null>(null);

function VideoPopoverMenuContextProvider({children}: ChildrenProps) {
    const {currentlyPlayingURL} = usePlaybackContext();
    const {translate} = useLocalize();
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<PlaybackSpeed>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[2]);
    const {isOffline} = useNetwork();
    const isLocalFile = currentlyPlayingURL && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => currentlyPlayingURL.startsWith(prefix));
    const playerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);

    const updatePlaybackSpeed = useCallback(
        (speed: PlaybackSpeed) => {
            setCurrentPlaybackSpeed(speed);
            playerRef.current?.setStatusAsync?.({rate: speed});
        },
        [playerRef],
    );

    const downloadAttachment = useCallback(() => {
        if (currentlyPlayingURL === null) {
            return;
        }
        const sourceURI = addEncryptedAuthTokenToURL(currentlyPlayingURL);
        fileDownload(sourceURI);
    }, [currentlyPlayingURL]);

    const menuItems = useMemo(() => {
        const items: PopoverMenuItem[] = [];

        if (!isOffline && !isLocalFile) {
            items.push({
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => {
                    downloadAttachment();
                },
            });
        }

        items.push({
            icon: Expensicons.Meter,
            text: translate('videoPlayer.playbackSpeed'),
            subMenuItems: CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS.map((speed) => ({
                icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : undefined,
                text: speed.toString(),
                onSelected: () => {
                    updatePlaybackSpeed(speed);
                },
                shouldPutLeftPaddingWhenNoIcon: true,
            })),
        });
        return items;
    }, [currentPlaybackSpeed, downloadAttachment, translate, updatePlaybackSpeed, isOffline, isLocalFile]);

    const contextValue = useMemo(() => ({menuItems, playerRef, updatePlaybackSpeed, setCurrentPlaybackSpeed}), [menuItems, playerRef, updatePlaybackSpeed, setCurrentPlaybackSpeed]);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useVideoPopoverMenuContext() {
    const videoPopooverMenuContext = useContext(Context);
    if (!videoPopooverMenuContext) {
        throw new Error('useVideoPopoverMenuContext must be used within a VideoPopoverMenuContext');
    }
    return videoPopooverMenuContext;
}

VideoPopoverMenuContextProvider.displayName = 'VideoPopoverMenuContextProvider';

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuContext};
