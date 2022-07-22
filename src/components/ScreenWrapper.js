import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View, KeyboardAvoidingView} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import HeaderGap from './HeaderGap';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import onScreenTransitionEnd from '../libs/onScreenTransitionEnd';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import withNavigation from './withNavigation';
import withWindowDimensions from './withWindowDimensions';
import OfflineIndicator from './OfflineIndicator';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';

const propTypes = {
    /** Array of additional styles to add */
    style: PropTypes.arrayOf(PropTypes.object),

    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    /** Whether to include padding bottom */
    includePaddingBottom: PropTypes.bool,

    /** Whether to include padding top */
    includePaddingTop: PropTypes.bool,

    // Called when navigated Screen's transition is finished.
    onTransitionEnd: PropTypes.func,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** The behavior to pass to the KeyboardAvoidingView, requires some trial and error depending on the layout/devices used.
     *  Search 'switch(behavior)' in ./node_modules/react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js for more context */
    keyboardAvoidingViewBehavior: PropTypes.oneOf(['padding', 'height', 'position']),

    // react-navigation navigation object available to screen components
    navigation: PropTypes.shape({
        // Method to attach listener to Navigation state.
        addListener: PropTypes.func.isRequired,
    }),

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates when an Alert modal is about to be visible */
        willAlertModalBecomeVisible: PropTypes.bool,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

};

const defaultProps = {
    style: [],
    includePaddingBottom: true,
    includePaddingTop: true,
    onTransitionEnd: () => {},
    navigation: {
        addListener: () => {},
    },
    modal: {},
    keyboardAvoidingViewBehavior: 'padding',
};

class ScreenWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            didScreenTransitionEnd: false,
        };
    }

    componentDidMount() {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        this.unsubscribeEscapeKey = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (this.props.modal.willAlertModalBecomeVisible) {
                return;
            }

            Navigation.dismissModal();
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);

        this.unsubscribeTransitionEnd = onScreenTransitionEnd(this.props.navigation, () => {
            this.setState({didScreenTransitionEnd: true});
            this.props.onTransitionEnd();
        });
    }

    componentWillUnmount() {
        if (this.unsubscribeEscapeKey) {
            this.unsubscribeEscapeKey();
        }
        if (this.unsubscribeTransitionEnd) {
            this.unsubscribeTransitionEnd();
        }
    }

    render() {
        return (
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
                    const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets);
                    const paddingStyle = {};

                    if (this.props.includePaddingTop) {
                        paddingStyle.paddingTop = paddingTop;
                    }

                    // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
                    if (this.props.includePaddingBottom || this.props.network.isOffline) {
                        paddingStyle.paddingBottom = paddingBottom;
                    }

                    return (
                        <View
                            style={[
                                ...this.props.style,
                                styles.flex1,
                                paddingStyle,
                            ]}
                        >
                            <KeyboardAvoidingView style={[styles.w100, styles.h100]} behavior={this.props.keyboardAvoidingViewBehavior}>
                                <HeaderGap />
                                {// If props.children is a function, call it to provide the insets to the children.
                                    _.isFunction(this.props.children)
                                        ? this.props.children({
                                            insets,
                                            didScreenTransitionEnd: this.state.didScreenTransitionEnd,
                                        })
                                        : this.props.children
                                }
                                <KeyboardShortcutsModal />
                                {this.props.isSmallScreenWidth && this.props.network.isOffline && (
                                    <View style={styles.chatItemComposeSecondaryRow}>
                                        <OfflineIndicator />
                                    </View>
                                )}
                            </KeyboardAvoidingView>
                        </View>
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
        );
    }
}

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default compose(
    withNavigation,
    withWindowDimensions,
    withOnyx({
        modal: {
            key: ONYXKEYS.MODAL,
        },
    }),
    withNetwork(),
)(ScreenWrapper);
