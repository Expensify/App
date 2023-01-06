import {View} from 'react-native';
import React from 'react';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import CONST from '../../CONST';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import Navigation from '../../libs/Navigation/Navigation';
import onScreenTransitionEnd from '../../libs/onScreenTransitionEnd';
import * as StyleUtils from '../../styles/StyleUtils';
import styles from '../../styles/styles';
import HeaderGap from '../HeaderGap';
import OfflineIndicator from '../OfflineIndicator';
import compose from '../../libs/compose';
import withNavigation from '../withNavigation';
import withWindowDimensions from '../withWindowDimensions';
import withEnvironment from '../withEnvironment';
import ONYXKEYS from '../../ONYXKEYS';
import {withNetwork} from '../OnyxProvider';
import {propTypes, defaultProps} from './propTypes';
import * as App from '../../libs/actions/App';
import TestToolsModal from '../TestToolsModal';

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

    /**
     * We explicitly want to ignore if props.modal changes, and only want to rerender if
     * any of the other props **used for the rendering output** is changed.
     * @param {Object} nextProps
     * @param {Object} nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState)
            || !_.isEqual(_.omit(this.props, 'modal'), _.omit(nextProps, 'modal'));
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
        // Open the test tools menu on 5 taps in dev only
        const quintupleTap = Gesture.Tap()
            .numberOfTaps(5)
            .onEnd(() => {
                if (this.props.environment !== CONST.ENVIRONMENT.DEV) {
                    return;
                }
                App.openTestToolModal();
            });
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
                        <GestureDetector gesture={quintupleTap}>
                            <View
                                style={[
                                    ...this.props.style,
                                    styles.flex1,
                                    paddingStyle,
                                ]}
                            >
                                <KeyboardAvoidingView style={[styles.w100, styles.h100]} behavior={this.props.keyboardAvoidingViewBehavior}>
                                    <HeaderGap />
                                    {(this.props.environment === CONST.ENVIRONMENT.DEV) && <TestToolsModal />}
                                    {// If props.children is a function, call it to provide the insets to the children.
                                        _.isFunction(this.props.children)
                                            ? this.props.children({
                                                insets,
                                                didScreenTransitionEnd: this.state.didScreenTransitionEnd,
                                            })
                                            : this.props.children
                                    }
                                    {this.props.isSmallScreenWidth && (
                                        <OfflineIndicator />
                                    )}
                                </KeyboardAvoidingView>
                            </View>
                        </GestureDetector>
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
        isTestToolsModalOpen: {
            key: ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
        },
    }),
    withNetwork(),
    withEnvironment,
)(ScreenWrapper);
