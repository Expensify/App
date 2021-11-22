import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import RoomAvatar from './RoomAvatar';
import stylePropTypes from '../styles/stylePropTypes';
import {withOnyx} from 'react-native-onyx';
import Profile from '../../assets/images/profile.svg';
import Icon from './Icon';
import colors from '../styles/colors'

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),

    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** Whether this avatar is for a default room */
    isDefaultChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived default room */
    isArchivedRoom: PropTypes.bool,
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isDefaultChatRoom: false,
    isArchivedRoom: false,
};

class Avatar extends PureComponent {
    avatarSource(imageStyle){
        if (!this.props.network.isOffline) {
            return(<Image source={{uri: this.props.source}} style={imageStyle}/>);
        } else {
           return(<Icon width={'100%'} height={'100%'} src={Profile} fill={colors.green}/>);
        }
    }

    render() {
        if (!this.props.source && !this.props.isDefaultChatRoom) {
            return null;
        }

        const imageStyle = [
            this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
            ...this.props.imageStyles,
        ];
                  
        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {this.props.isDefaultChatRoom
                    ? <RoomAvatar avatarStyle={imageStyle} isArchived={this.props.isArchivedRoom} />
                    :  this.avatarSource(imageStyle)}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default withOnyx({
    network: {
        key: 'network',
    }
})(Avatar);
