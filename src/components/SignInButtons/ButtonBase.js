import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /** The on press method */
    onPress: PropTypes.func,

    /** The icon to render */
    icon: PropTypes.func,
};

const defaultProps = {
    onPress: () => {},
    icon: null,
};

const ButtonBase = ({onPress, icon}) => (
    <Pressable
        onPress={onPress}
        style={styles.signInButtonBase}
    >
        {icon}
    </Pressable>
);

ButtonBase.displayName = 'ButtonBase';
ButtonBase.propTypes = propTypes;
ButtonBase.defaultProps = defaultProps;

export default ButtonBase;
