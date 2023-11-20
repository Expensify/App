import React from 'react';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';

const propTypes = {};
const defaultProps = {};

function VideoPopoverMenu() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {playbackSpeeds, currentPlaybackSpeed, updatePlaybackSpeed} = usePlaybackContext();
    const {isPopoverVisible, hidePopover, anchorPosition} = useVideoPopoverMenuContext();

    const playbackSpeedSubMenuItems = _.map(playbackSpeeds, (speed) => ({
        icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : null,
        text: speed,
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
