import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';
import Log from '../libs/Log';

const propTypes = {
    /** Name used in the logs if the loader is displayed for too long time */
    name: PropTypes.string,

    /** Optional duration (ms) after which a message would be logged if the loader is still covering the screen */
    timeout: PropTypes.number,

    /** Additional style props */
    style: stylePropTypes,
};

const defaultProps = {
    timeout: 0,
    name: '',
    style: [],
};

/**
 * Loading indication component intended to cover the whole page, while the page prepares for initial render
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
class FullScreenLoadingIndicator extends React.Component {
    componentDidMount() {
        if (!this.props.name || !this.props.timeout) {
            return;
        }

        Log.info(`[LoadingIndicator] "${this.props.name}" became visible`);

        this.timeoutId = setTimeout(
            () => Log.alert(
                `[LoadingIndicator] "${this.props.name}" is still visible after ${this.props.timeout} ms`,
                '',
                false,
            ),
            this.props.timeout,
        );
    }

    componentWillUnmount() {
        if (!this.timeoutId) {
            return;
        }

        clearTimeout(this.timeoutId);
        Log.info(`[LoadingIndicator] "${this.props.name}" disappeared`);
    }

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
