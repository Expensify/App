import React from 'react';
import _ from 'underscore';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import * as Expensicons from '../Icon/Expensicons';
import PopoverMenu from '../PopoverMenu';
import {usePlaybackContext} from '../VideoPlayerContexts/PlaybackContext';
import {useVideoPopoverMenuContext} from '../VideoPlayerContexts/VideoPopoverMenuContext';

const propTypes = {};

const defaultProps = {};

function VideoPopoverMenu() {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {playbackSpeeds, currentPlaybackSpeed, updatePlaybackSpeed} = usePlaybackContext();
    const {isPopoverVisible, hidePopover, anchorPosition} = useVideoPopoverMenuContext();

    const playbackSpeedSubMenuItems = _.map(playbackSpeeds, (speed) => ({
        icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : null,
        text: speed,
        onSelected: () => {
            console.log(`${speed}x`);
            updatePlaybackSpeed(speed);
        },
        putLeftPaddingWhenNoIcon: true,
    }));

    const menuItems = [
        {
            icon: Expensicons.Download,
            text: 'Download',
            onSelected: () => {
                console.log('Download');
            },
        },
        {
            icon: Expensicons.Meter,
            text: 'Playback speed',
            onSelected: () => {
                console.log('Playback speed');
            },
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
