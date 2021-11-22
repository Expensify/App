import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Controls whether the loader is mounted and displayed */
    visible: PropTypes.bool,

    /** Additional style props */
    style: stylePropTypes,
};

const defaultProps = {
    visible: true,
    style: [],
};

/**
 * Loading indication component intended to cover the whole page, while the page prepares for initial render
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const FullScreenLoadingIndicator = (props) => {
    if (!props.visible) {
        return null;
    }

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
