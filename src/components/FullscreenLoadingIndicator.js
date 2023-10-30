import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import _ from 'underscore';
import stylePropTypes from '@styles/stylePropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Additional style props */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

function FullScreenLoadingIndicator(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, ...additionalStyles]}>
            <ActivityIndicator
                color={theme.spinner}
                size="large"
            />
        </View>
    );
}

FullScreenLoadingIndicator.propTypes = propTypes;
FullScreenLoadingIndicator.defaultProps = defaultProps;
FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
