import React from 'react';
import {
    StyleSheet, View, ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const propTypes = {
    /** Size of spinner */
    size: PropTypes.string,
};

const defaultProps = {
    size: 'large',
};

function LoadingSpinnerOverlay(props) {
    return (
        <View style={{...StyleSheet.absoluteFillObject}}>
            <ActivityIndicator
                size={props.size}
                color={themeColors.spinner}
                style={[styles.flex1]}
            />
        </View>
    );
}

LoadingSpinnerOverlay.propTypes = propTypes;
LoadingSpinnerOverlay.defaultProps = defaultProps;
LoadingSpinnerOverlay.displayName = 'LoadingSpinnerOverlay';

export default LoadingSpinnerOverlay;
