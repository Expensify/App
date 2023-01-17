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

class FullScreenLoadingIndicator extends React.Component {
    render() {
        const additionalStyles = _.isArray(this.props.style) ? this.props.style : [this.props.style];
        return (
            <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, ...additionalStyles]}>
                <ActivityIndicator color={themeColors.spinner} size="large" />
            </View>
        );
    }
}

FullScreenLoadingIndicator.propTypes = propTypes;
FullScreenLoadingIndicator.defaultProps = defaultProps;
FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
