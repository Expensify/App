import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Url source for the avatar
    source: PropTypes.string,

    // Extra styles to pass
    style: PropTypes.arrayOf(PropTypes.any),

    // Set the size of Avatar
    size: PropTypes.oneOf(['default', 'small']),
};

const defaultProps = {
    source: '',
    style: [],
    size: 'default',
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source) {
            return null;
        }

        return (
            <Image
                source={{uri: this.props.source}}
                style={_.union([
                    this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
                    this.props.style,
                ])}
            />
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
