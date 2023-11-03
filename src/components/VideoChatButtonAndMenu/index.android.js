import React from 'react';
import CONST from '@src/CONST';
import BaseVideoChatButtonAndMenu from './BaseVideoChatButtonAndMenu';
import {defaultProps, propTypes} from './videoChatButtonAndMenuPropTypes';

// On Android creating a new google meet meeting requires the CALL_PHONE permission in some cases
// so we're just opening the google meet app instead, more details:
// https://github.com/Expensify/App/issues/8851#issuecomment-1120236904
function VideoChatButtonAndMenu(props) {
    return (
        <BaseVideoChatButtonAndMenu
            googleMeetURL={CONST.GOOGLE_MEET_URL_ANDROID}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

VideoChatButtonAndMenu.propTypes = propTypes;
VideoChatButtonAndMenu.defaultProps = defaultProps;
VideoChatButtonAndMenu.displayName = 'VideoChatButtonAndMenu';
export default VideoChatButtonAndMenu;
