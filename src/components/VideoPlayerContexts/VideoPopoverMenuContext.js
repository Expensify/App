import PropTypes from 'prop-types';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import {usePlaybackContext} from './PlaybackContext';

const VideoPopoverMenuContext = React.createContext(null);

function VideoPopoverMenuContextProvider({children}) {
    const {currentVideoPlayerRef, currentlyPlayingURL} = usePlaybackContext();
    const {translate} = useLocalize();
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS[2]);
    const {isOffline} = useNetwork();
    const isLocalFile = currentlyPlayingURL && _.some(CONST.ATTACHMENT_LOCAL_URL_PREFIX, (prefix) => currentlyPlayingURL.startsWith(prefix));

    const updatePlaybackSpeed = useCallback(
        (speed) => {
            setCurrentPlaybackSpeed(speed);
            currentVideoPlayerRef.current.setStatusAsync({rate: speed});
        },
        [currentVideoPlayerRef],
    );

    const downloadAttachment = useCallback(() => {
        const sourceURI = addEncryptedAuthTokenToURL(currentlyPlayingURL);
        fileDownload(sourceURI);
    }, [currentlyPlayingURL]);

    const menuItems = useMemo(() => {
        const items = [];

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
            subMenuItems: [
                ..._.map(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS, (speed) => ({
                    icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : null,
                    text: speed.toString(),
                    onSelected: () => {
                        updatePlaybackSpeed(speed);
                    },
                    shouldPutLeftPaddingWhenNoIcon: true,
                })),
            ],
        });

        return items;
    }, [currentPlaybackSpeed, downloadAttachment, translate, updatePlaybackSpeed, isOffline, isLocalFile]);

    const contextValue = useMemo(() => ({menuItems, updatePlaybackSpeed}), [menuItems, updatePlaybackSpeed]);
    return <VideoPopoverMenuContext.Provider value={contextValue}>{children}</VideoPopoverMenuContext.Provider>;
}

function useVideoPopoverMenuContext() {
    const context = useContext(VideoPopoverMenuContext);
    if (context === undefined) {
        throw new Error('useVideoPopoverMenuContext must be used within a VideoPopoverMenuContext');
    }
    return context;
}

VideoPopoverMenuContextProvider.displayName = 'VideoPopoverMenuContextProvider';
VideoPopoverMenuContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuContext};
