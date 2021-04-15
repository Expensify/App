import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import Navigation from '../../Navigation';
import styles from '../../../../styles/styles';

const propTypes = {
    isDisplayingModal: PropTypes.bool.isRequired,
};

const ClickAwayHandler = (props) => {
    if (!props.isDisplayingModal) {
        return null;
    }

    return (
        <Pressable
            style={styles.navigationModalOverlay}
            onPress={() => Navigation.dismissModal()}
        />
    );
};

ClickAwayHandler.propTypes = propTypes;
ClickAwayHandler.displayName = 'ClickAwayHandler';
export default ClickAwayHandler;
