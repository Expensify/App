import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';

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

function ButtonBase({onPress, icon}) {
    return (
        <PressableWithoutFeedback
            onPress={onPress}
            style={styles.signInButtonBase}
        >
            {icon}
        </PressableWithoutFeedback>
    );
}

ButtonBase.displayName = 'ButtonBase';
ButtonBase.propTypes = propTypes;
ButtonBase.defaultProps = defaultProps;

export default ButtonBase;
