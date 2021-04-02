import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles, {getSafeAreaPadding} from '../styles/styles';
import HeaderGap from './HeaderGap';

const propTypes = {
    // Array of additional styles to add
    style: PropTypes.arrayOf(PropTypes.object),

    // Returns a function as a child to pass insets to or a node to render without insets
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    // Whether to include padding bottom
    includePaddingBottom: PropTypes.bool,

    // Whether to include padding top
    includePaddingTop: PropTypes.bool,
};

const defaultProps = {
    style: [],
    includePaddingBottom: true,
    includePaddingTop: true,
};

const ScreenWrapper = props => (
    <SafeAreaInsetsContext.Consumer>
        {(insets) => {
            const {paddingTop, paddingBottom} = getSafeAreaPadding(insets);
            const paddingStyle = {};

            if (props.includePaddingTop) {
                paddingStyle.paddingTop = paddingTop;
            }

            if (props.includePaddingBottom) {
                paddingStyle.paddingBottom = paddingBottom;
            }

            return (
                <View style={[
                    ...props.style,
                    styles.flex1,
                    paddingStyle,
                ]}
                >
                    <HeaderGap />
                    {// If props.children is a function, call it to provide the insets to the children.
                        _.isFunction(props.children)
                            ? props.children(insets)
                            : props.children
                    }
                </View>
            );
        }}
    </SafeAreaInsetsContext.Consumer>
);

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;
ScreenWrapper.displayName = 'ScreenWrapper';
export default ScreenWrapper;
