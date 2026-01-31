import type {VideoPlayer} from 'expo-video';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackSpeed, VideoPopoverMenuContext} from './types';

const Context = React.createContext<VideoPopoverMenuContext | null>(null);

function VideoPopoverMenuContextProvider({children}: ChildrenProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Download', 'Meter'] as const);
    const {translate} = useLocalize();
    const [source, setSource] = useState('');
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<PlaybackSpeed>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[3]);
    const {isOffline} = useNetwork();
    const isLocalFile = source && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => source.startsWith(prefix));
    const videoPopoverMenuPlayerRef = useRef<VideoPlayer>(null);

    const updatePlaybackSpeed = useCallback(
        (speed: PlaybackSpeed) => {
            setCurrentPlaybackSpeed(speed);
            if (!videoPopoverMenuPlayerRef.current) {
                return;
            }
            videoPopoverMenuPlayerRef.current.playbackRate = speed;
        },
        [videoPopoverMenuPlayerRef],
    );

    const updateVideoPopoverMenuPlayerRef = (videoPlayer: VideoPlayer | null) => {
        videoPopoverMenuPlayerRef.current = videoPlayer;
    };

    const downloadAttachment = useCallback(() => {
        if (typeof source === 'number' || !source) {
            return;
        }
        fileDownload(translate, addEncryptedAuthTokenToURL(source));
    }, [source, translate]);

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

    const contextValue = useMemo(() => ({menuItems, updateVideoPopoverMenuPlayerRef, updatePlaybackSpeed, updateSource: setSource}), [menuItems, updatePlaybackSpeed, setSource]);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useVideoPopoverMenuContext() {
    const videoPopoverMenuContext = useContext(Context);
    if (!videoPopoverMenuContext) {
        throw new Error('useVideoPopoverMenuContext must be used within a VideoPopoverMenuContext');
    }
    return videoPopoverMenuContext;
}

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuContext};
