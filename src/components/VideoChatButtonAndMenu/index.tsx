import React from 'react';
import CONST from '@src/CONST';
import BaseVideoChatButtonAndMenu from './BaseVideoChatButtonAndMenu';
import type VideoChatButtonAndMenuProps from './types';

function VideoChatButtonAndMenu(props: VideoChatButtonAndMenuProps) {
    return (
        <BaseVideoChatButtonAndMenu
            googleMeetURL={CONST.NEW_GOOGLE_MEET_MEETING_URL}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

VideoChatButtonAndMenu.displayName = 'VideoChatButtonAndMenu';

export default VideoChatButtonAndMenu;
