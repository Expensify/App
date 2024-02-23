import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import fileDownload from '@libs/fileDownload';
import * as Url from '@libs/Url';
import CONST from '@src/CONST';
import {usePlaybackContext} from './PlaybackContext';
import type {MenuItem, SingularMenuItem, VideoPopoverMenuContext} from './types';

const Context = React.createContext<VideoPopoverMenuContext | null>(null);

function VideoPopoverMenuContextProvider({children}: {children: ReactNode}) {
    const {currentVideoPlayerRef} = usePlaybackContext();
    const {translate} = useLocalize();
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState<number>(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[2]);

    const updatePlaybackSpeed = useCallback(
        (speed: number) => {
            setCurrentPlaybackSpeed(speed);
            currentVideoPlayerRef.current?.setStatusAsync({rate: speed});
        },
        [currentVideoPlayerRef],
    );

    const downloadAttachment = useCallback(() => {
        currentVideoPlayerRef.current?.getStatusAsync().then((status) => {
            if (!('uri' in status)) {
                return;
            }
            const sourceURI = `/${Url.getPathFromURL(status.uri)}`;
            fileDownload(sourceURI);
        });
    }, [currentVideoPlayerRef]);

    const menuItems = useMemo(
        () =>
            [
                {
                    icon: Expensicons.Download,
                    text: translate('common.download'),
                    onSelected: () => {
                        downloadAttachment();
                    },
                },
                {
                    icon: Expensicons.Meter,
                    text: translate('videoPlayer.playbackSpeed'),
                    subMenuItems: CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS.map((speed) => ({
                        icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : null,
                        text: speed.toString(),
                        onSelected: () => {
                            updatePlaybackSpeed(speed);
                        },
                        shouldPutLeftPaddingWhenNoIcon: true,
                    })),
                },
            ] as [SingularMenuItem, MenuItem],
        [currentPlaybackSpeed, downloadAttachment, translate, updatePlaybackSpeed],
    );

    const contextValue = useMemo(() => ({menuItems, updatePlaybackSpeed}), [menuItems, updatePlaybackSpeed]);
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
