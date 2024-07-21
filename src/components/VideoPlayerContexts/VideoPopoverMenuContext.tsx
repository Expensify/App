import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
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
    const videoPopoverMenuPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);

    const updatePlaybackSpeed = useCallback(
        (speed: PlaybackSpeed) => {
            setCurrentPlaybackSpeed(speed);
            videoPopoverMenuPlayerRef.current?.setStatusAsync?.({rate: speed});
        },
        [videoPopoverMenuPlayerRef],
    );

    const downloadAttachment = useCallback(() => {
        if (videoPopoverMenuPlayerRef.current === null) {
            return;
        }
        const {source} = videoPopoverMenuPlayerRef.current?.props ?? {};
        if (typeof source === 'number' || !source) {
            return;
        }
        fileDownload(source.uri);
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
                isSelected: currentPlaybackSpeed === speed,
            })),
        });
        return items;
    }, [currentPlaybackSpeed, downloadAttachment, translate, updatePlaybackSpeed, isOffline, isLocalFile]);

    const contextValue = useMemo(
        () => ({menuItems, videoPopoverMenuPlayerRef, updatePlaybackSpeed, setCurrentPlaybackSpeed}),
        [menuItems, videoPopoverMenuPlayerRef, updatePlaybackSpeed, setCurrentPlaybackSpeed],
    );
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
