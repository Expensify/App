import _ from 'underscore';
import React, {memo} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass */
    style: PropTypes.arrayOf(PropTypes.any),

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),
};

const defaultProps = {
    source: '',
    style: [],
    size: 'default',
};

const Avatar = (props) => {
    if (!props.source) {
        return null;
    }

    return (
        <Image
            source={{uri: props.source}}
            style={[
                props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
                ...props.style,
            ]}
        />
    );
};

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;

export default memo(Avatar, (prevProps, nextProps) => (
    prevProps.source === nextProps.source
        && _.isEqual(prevProps.style, nextProps.style)
));
