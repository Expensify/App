import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import * as Expensicons from '../Icon/Expensicons';
import PopoverMenu from '../PopoverMenu';
import {usePlaybackContext} from '../VideoPlayerContexts/PlaybackContext';

const propTypes = {
    isActive: PropTypes.bool.isRequired,
};

const defaultProps = {};

function VideoPopoverMenu({isActive}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {playbackSpeeds, currentPlaybackSpeed, updatePlaybackSpeed} = usePlaybackContext();
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({vertical: 0, horizontal: 0});
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(isActive);

    const showCreateMenu = () => {
        setIsCreateMenuActive(true);
    };

    const hideCreateMenu = () => {
        setIsCreateMenuActive(false);
    };

    useEffect(() => {
        setIsCreateMenuActive(isActive);
    }, [isActive]);

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
            onClose={hideCreateMenu}
            onItemSelected={hideCreateMenu}
            isVisible={isCreateMenuActive}
            anchorPosition={popoverAnchorPosition}
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
