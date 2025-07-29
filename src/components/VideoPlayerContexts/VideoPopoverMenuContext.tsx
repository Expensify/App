import type {VideoPlayer} from 'expo-video';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackSpeed, VideoPopoverMenuContext} from './types';

const Context = React.createContext<VideoPopoverMenuContext | null>(null);

function VideoPopoverMenuContextProvider({children}: ChildrenProps) {
    const {translate} = useLocalize();
    const [source, setSource] = useState('');
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<PlaybackSpeed>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[3]);
    const {isOffline} = useNetwork();
    const isLocalFile = source && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => source.startsWith(prefix));
    const videoPopoverMenuPlayerRef = useRef<VideoPlayer>(null);
    const videoPopoverMenuSource = useRef<string | null>(null);

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

    const downloadAttachment = useCallback(() => {
        if (typeof source === 'number' || !source) {
            return;
        }
        fileDownload(addEncryptedAuthTokenToURL(source));
    }, [source]);

    const menuItems = useMemo(() => {
        const items: PopoverMenuItem[] = [];

        if (!isOffline && !isLocalFile) {
            // eslint-disable-next-line react-compiler/react-compiler
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
                text: speed === 1 ? translate('videoPlayer.normal') : speed.toString(),
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
        () => ({menuItems, videoPopoverMenuPlayerRef, videoPopoverMenuSource, currentPlaybackSpeed, updatePlaybackSpeed, setCurrentPlaybackSpeed, setSource}),
        [menuItems, videoPopoverMenuPlayerRef, videoPopoverMenuSource, currentPlaybackSpeed, updatePlaybackSpeed, setCurrentPlaybackSpeed, setSource],
    );
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useVideoPopoverMenuContext() {
    const videoPopoverMenuContext = useContext(Context);
    if (!videoPopoverMenuContext) {
        throw new Error('useVideoPopoverMenuContext must be used within a VideoPopoverMenuContext');
    }
    return videoPopoverMenuContext;
}

VideoPopoverMenuContextProvider.displayName = 'VideoPopoverMenuContextProvider';

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuContext};
