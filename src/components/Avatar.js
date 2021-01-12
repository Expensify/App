import React, {memo} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Url source for the avatar
    source: PropTypes.string.isRequired,

    // Extra styles to pass
    style: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
    style: [],
};

const Avatar = ({source, style}) => (
    <Image
        source={{uri: source}}
        style={[
            styles.avatarNormal,
            ...style,
        ]}
    />
);

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default memo(Avatar);
