import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import RoomAvatar from './RoomAvatar';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),

    /** Whether this avatar is for a chat room */
    isChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived default room */
    isArchivedRoom: PropTypes.bool,
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isChatRoom: false,
    isArchivedRoom: false,
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source && !this.props.isChatRoom) {
            return null;
        }

        const imageStyle = [
            this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,

            // Background color isn't added for room avatar because it changes it's shape to a square
            this.props.isChatRoom ? {} : {backgroundColor: themeColors.icon},
            ...this.props.imageStyles,
        ];

        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {this.props.isChatRoom
                    ? <RoomAvatar avatarStyle={imageStyle} isArchived={this.props.isArchivedRoom} />
                    : <Image source={{uri: this.props.source}} style={imageStyle} />}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
