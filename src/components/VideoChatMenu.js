import React from 'react';
import PropTypes from 'prop-types';
import Popover from './Popover';
import MenuItem from './MenuItem';
import openURLInNewTab from '../libs/openURLInNewTab';
import ZoomIcon from '../../assets/images/zoom-icon.svg';
import GoogleMeetIcon from '../../assets/images/google-meet.svg';
import CONST from '../CONST';

const propTypes = {
    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback that determines behavior when menu is closed
    onClose: PropTypes.func.isRequired,

    // Anchor position of the menu
    anchorPosition: PropTypes.shape({
        // x position of the anchor icon
        x: PropTypes.number,

        // y position of the anchor icon
        y: PropTypes.number,
    }).isRequired,
};

const VideoChatMenu = (props) => {
    const menuItemData = [
        {
            icon: ZoomIcon,
            text: 'Zoom',
            onPress: () => openURLInNewTab(CONST.NEW_ZOOM_MEETING_URL),
        },
        {
            icon: GoogleMeetIcon,
            text: 'Google Meet',
            onPress: () => openURLInNewTab(CONST.NEW_GOOGLE_MEET_MEETING_URL),
        },
    ].map(item => ({
        ...item,
        onPress: () => {
            item.onPress();
            props.onClose();
        },
    }));

    return (
        <Popover
            onClose={props.onClose}
            isVisible={props.isVisible}
            anchorPosition={{
                left: props.anchorPosition.x - 150,
                top: props.anchorPosition.y + 40,
            }}
        >
            {menuItemData.map(({icon, text, onPress}) => (
                <MenuItem
                    key={text}
                    icon={icon}
                    title={text}
                    onPress={onPress}
                />
            ))}
        </Popover>
    );
};


VideoChatMenu.propTypes = propTypes;
VideoChatMenu.displayName = 'VideoChatMenu';
export default VideoChatMenu;
