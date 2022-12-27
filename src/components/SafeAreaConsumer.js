import React from 'react';
import PropTypes from 'prop-types';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    /** Children to render. */
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]).isRequired,
};

const SafeAreaConsumer = props => (
    <SafeAreaInsetsContext.Consumer>
        {(insets) => {
            const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets);
            return props.children({
                paddingTop, paddingBottom, insets, safeAreaPaddingBottomStyle: {paddingBottom},
            });
        }}
    </SafeAreaInsetsContext.Consumer>
);

SafeAreaConsumer.displayName = 'SafeAreaConsumer';
SafeAreaConsumer.propTypes = propTypes;
export default SafeAreaConsumer;
