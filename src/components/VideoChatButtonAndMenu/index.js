import React from 'react';
import {propTypes, defaultProps} from './videoChatButtonAndMenuPropTypes';
import BaseVideoChatButtonAndMenu from './BaseVideoChatButtonAndMenu';

const VideoChatButtonAndMenu = props => (
    <BaseVideoChatButtonAndMenu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

VideoChatButtonAndMenu.propTypes = propTypes;
VideoChatButtonAndMenu.defaultProps = defaultProps;
VideoChatButtonAndMenu.displayName = 'VideoChatButtonAndMenu';
export default VideoChatButtonAndMenu;
