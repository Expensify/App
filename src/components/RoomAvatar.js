import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import ActiveRoomAvatar from '../../assets/images/avatars/room.svg';
import DeletedRoomAvatar from '../../assets/images/avatars/deleted-room.svg';

const propTypes = {
    /** Extra styles to pass to Image */
    avatarStyle: PropTypes.arrayOf(PropTypes.object),

    /** Whether the room this avatar is for is deleted or not */
    isArchived: PropTypes.bool,
};

const defaultProps = {
    avatarStyle: [],
    isArchived: false,
};

class RoomAvatar extends PureComponent {
    render() {
        return (this.props.isArchived
            ? <DeletedRoomAvatar style={StyleSheet.flatten(this.props.avatarStyle)} />
            : <ActiveRoomAvatar style={StyleSheet.flatten(this.props.avatarStyle)} />
        );
    }
}

RoomAvatar.defaultProps = defaultProps;
RoomAvatar.propTypes = propTypes;
export default RoomAvatar;
