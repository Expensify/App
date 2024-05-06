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
    const {currentVideoPlayerRef, currentlyPlayingURL} = usePlaybackContext();
    const {translate} = useLocalize();
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<PlaybackSpeed>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[2]);
    const {isOffline} = useNetwork();
    const isLocalFile = currentlyPlayingURL && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => currentlyPlayingURL.startsWith(prefix));
    const videoPopoverMenuPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);

    const updatePlaybackSpeed = useCallback(
        (speed: PlaybackSpeed) => {
            setCurrentPlaybackSpeed(speed);
            currentVideoPlayerRef.current?.setStatusAsync?.({rate: speed});
        },
        [currentVideoPlayerRef],
    );

    const downloadAttachment = useCallback(() => {
        if (videoPopoverMenuPlayerRef.current === null) {
            return;
        }
        const {source} = videoPopoverMenuPlayerRef.current?.props ?? {};
        if (typeof source === 'number' || !source) {
            return;
        }
        const sourceURI = addEncryptedAuthTokenToURL(source.uri);
        fileDownload(sourceURI);
    }, [videoPopoverMenuPlayerRef]);

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

    const contextValue = useMemo(() => ({menuItems, videoPopoverMenuPlayerRef, updatePlaybackSpeed}), [menuItems, videoPopoverMenuPlayerRef, updatePlaybackSpeed]);
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
