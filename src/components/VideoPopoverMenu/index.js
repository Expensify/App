import React, {useEffect, useState} from 'react';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

const propTypes = {};
const defaultProps = {};

function VideoPopoverMenu() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {isPopoverVisible, hidePopover, anchorPosition, targetVideoPlayerRef} = useVideoPopoverMenuContext();

    const [playbackSpeeds] = useState(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS);
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(playbackSpeeds[2]);

    const updatePlaybackSpeed = (speed) => {
        targetVideoPlayerRef.current.setStatusAsync({rate: speed});
        setCurrentPlaybackSpeed(speed);
    };

    const playbackSpeedSubMenuItems = _.map(playbackSpeeds, (speed) => ({
        icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : null,
        text: speed.toString(),
        onSelected: () => updatePlaybackSpeed(speed),
        shouldPutLeftPaddingWhenNoIcon: true,
    }));

    const menuItems = [
        {
            icon: Expensicons.Download,
            text: translate('common.download'),
            onSelected: () => {
                // TODO: Implement download
            },
        },
        {
            icon: Expensicons.Meter,
            text: translate('videoPlayer.playbackSpeed'),
            subMenuItems: playbackSpeedSubMenuItems,
        },
    ];

    useEffect(() => {
        if (!isPopoverVisible) {
            return;
        }
        targetVideoPlayerRef.current.getStatusAsync().then((status) => {
            setCurrentPlaybackSpeed(status.rate);
        });
    }, [isPopoverVisible, playbackSpeeds, targetVideoPlayerRef]);

    return (
        <PopoverMenu
            onClose={hidePopover}
            onItemSelected={hidePopover}
            isVisible={isPopoverVisible}
            anchorPosition={anchorPosition}
            fromSidebarMediumScreen={!isSmallScreenWidth}
            menuItems={menuItems}
            withoutOverlay
        />
    );
}

VideoPopoverMenu.propTypes = propTypes;
VideoPopoverMenu.defaultProps = defaultProps;
VideoPopoverMenu.displayName = 'VideoPopoverMenu';

export default VideoPopoverMenu;
