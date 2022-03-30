import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';
import Log from '../libs/Log';
import CONST from '../CONST';

const propTypes = {
    /**
     * Context info printed in timing log.
     * Providing this prop would capture logs for mounting/unmounting and staying visible for too long
     */
    logDetail: PropTypes.shape({
        /** Name is used to distinct the loader in captured logs. */
        name: PropTypes.string.isRequired,
    }),

    /** Additional style props */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
    logDetail: null,
};

/**
 * Loading indication component intended to cover the whole page, while the page prepares for initial render
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
class FullScreenLoadingIndicator extends React.Component {
    componentDidMount() {
        if (!this.props.logDetail) {
            return;
        }

        if (!this.props.logDetail.name) {
            throw new Error('A name should be set to distinct logged messages. Please check the `logDetails` prop');
        }

        Log.info('[LoadingIndicator] Became visible', false, this.props.logDetail);

        this.timeoutID = setTimeout(
            () => Log.alert(
                `${CONST.ERROR.ENSURE_BUGBOT} [LoadingIndicator] Visible after timeout`,
                {timeout: CONST.TIMING.SPINNER_TIMEOUT, ...this.props.logDetail},
                false,
            ),
            CONST.TIMING.SPINNER_TIMEOUT,
        );
    }

    componentWillUnmount() {
        if (!this.timeoutID) {
            return;
        }

        clearTimeout(this.timeoutID);
        Log.info('[LoadingIndicator] Disappeared', false, this.props.logDetail);
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
