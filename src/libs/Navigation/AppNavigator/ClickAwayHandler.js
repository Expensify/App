import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import Navigation from '../Navigation';
import styles from '../../../styles/styles';

const propTypes = {
    /** Whether a modal is currently being displayed */
    isDisplayingModal: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const ClickAwayHandler = (props) => {
    if (!props.isDisplayingModal || props.isSmallScreenWidth) {
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
export default withWindowDimensions(ClickAwayHandler);
