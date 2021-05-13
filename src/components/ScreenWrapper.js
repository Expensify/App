import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withNavigation} from '@react-navigation/compat';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles, {getSafeAreaPadding} from '../styles/styles';
import HeaderGap from './HeaderGap';
import KeyboardShortcut from '../libs/KeyboardShortcut';

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

    // react-navigation object that will allow us to goBack()
    navigation: PropTypes.shape({

        // Returns to the previous navigation state e.g. if this is inside a Modal we will dismiss it
        goBack: PropTypes.func,
    }),
};

const defaultProps = {
    style: [],
    includePaddingBottom: true,
    includePaddingTop: true,
    navigation: {
        goBack: () => {},
    },
};

class ScreenWrapper extends React.Component {
    componentDidMount() {
        this.unsubscribe = KeyboardShortcut.subscribe('Escape', () => {
            this.props.navigation.goBack();
        }, [], true);
    }

    componentWillUnmount() {
        if (!this.unsubscribe) {
            return;
        }

        this.unsubscribe();
    }

    render() {
        return (
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
                    const {paddingTop, paddingBottom} = getSafeAreaPadding(insets);
                    const paddingStyle = {};

                    if (this.props.includePaddingTop) {
                        paddingStyle.paddingTop = paddingTop;
                    }

                    if (this.props.includePaddingBottom) {
                        paddingStyle.paddingBottom = paddingBottom;
                    }

                    return (
                        <View style={[
                            ...this.props.style,
                            styles.flex1,
                            paddingStyle,
                        ]}
                        >
                            <HeaderGap />
                            {// If props.children is a function, call it to provide the insets to the children.
                                _.isFunction(this.props.children)
                                    ? this.props.children(insets)
                                    : this.props.children
                            }
                        </View>
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
        );
    }
}

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;
ScreenWrapper.displayName = 'ScreenWrapper';
export default withNavigation(ScreenWrapper);
