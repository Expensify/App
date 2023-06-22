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

function IconButton({onPress, icon}) {
    return (
        <PressableWithoutFeedback
            onPress={onPress}
            style={styles.signInIconButton}
        >
            {icon}
        </PressableWithoutFeedback>
    );
}

IconButton.displayName = 'IconButton';
IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;

export default IconButton;
