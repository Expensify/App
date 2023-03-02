import _ from 'underscore';
import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Additional style props */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

const FullScreenLoadingIndicator = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, ...additionalStyles]}>
            <ActivityIndicator color={themeColors.spinner} size="large" />
        </View>
    );
};

FullScreenLoadingIndicator.propTypes = propTypes;
FullScreenLoadingIndicator.defaultProps = defaultProps;
FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
