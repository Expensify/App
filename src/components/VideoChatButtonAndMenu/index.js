import React from 'react';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './videoChatButtonAndMenuPropTypes';
import BaseVideoChatButtonAndMenu from './BaseVideoChatButtonAndMenu';

const VideoChatButtonAndMenu = props => (
    <BaseVideoChatButtonAndMenu
        googleMeetURL={CONST.NEW_GOOGLE_MEET_MEETING_URL}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

VideoChatButtonAndMenu.propTypes = propTypes;
VideoChatButtonAndMenu.defaultProps = defaultProps;
VideoChatButtonAndMenu.displayName = 'VideoChatButtonAndMenu';
export default VideoChatButtonAndMenu;
