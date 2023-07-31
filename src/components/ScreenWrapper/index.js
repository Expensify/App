import {Keyboard, View, PanResponder} from 'react-native';
import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {PickerAvoidingView} from 'react-native-picker-select';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import HeaderGap from '../HeaderGap';
import OfflineIndicator from '../OfflineIndicator';
import compose from '../../libs/compose';
import withNavigation from '../withNavigation';
import {withNetwork} from '../OnyxProvider';
import {propTypes, defaultProps} from './propTypes';
import SafeAreaConsumer from '../SafeAreaConsumer';
import TestToolsModal from '../TestToolsModal';
import withKeyboardState from '../withKeyboardState';
import withWindowDimensions from '../withWindowDimensions';
import withEnvironment from '../withEnvironment';
import toggleTestToolsModal from '../../libs/actions/TestTool';
import CustomDevMenu from '../CustomDevMenu';

class ScreenWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponderCapture: (e, gestureState) => gestureState.numberActiveTouches === CONST.TEST_TOOL.NUMBER_OF_TAPS,
            onPanResponderRelease: toggleTestToolsModal,
        });

        this.state = {
            didScreenTransitionEnd: false,
        };
    }

    componentDidMount() {
        this.unsubscribeTransitionEnd = this.props.navigation.addListener('transitionEnd', (event) => {
            // Prevent firing the prop callback when user is exiting the page.
            if (lodashGet(event, 'data.closing')) {
                return;
            }
            this.setState({didScreenTransitionEnd: true});
            this.props.onEntryTransitionEnd();
        });

        // We need to have this prop to remove keyboard before going away from the screen, to avoid previous screen look weird for a brief moment,
        // also we need to have generic control in future - to prevent closing keyboard for some rare cases in which beforeRemove has limitations
        // described here https://reactnavigation.org/docs/preventing-going-back/#limitations
        if (this.props.shouldDismissKeyboardBeforeClose) {
            this.beforeRemoveSubscription = this.props.navigation.addListener('beforeRemove', () => {
                if (!this.props.isKeyboardShown) {
                    return;
                }
                Keyboard.dismiss();
            });
        }
    }

    /**
     * We explicitly want to ignore if props.modal changes, and only want to rerender if
     * any of the other props **used for the rendering output** is changed.
     * @param {Object} nextProps
     * @param {Object} nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState) || !_.isEqual(_.omit(this.props, 'modal'), _.omit(nextProps, 'modal'));
    }

    componentWillUnmount() {
        if (this.unsubscribeTransitionEnd) {
            this.unsubscribeTransitionEnd();
        }
        if (this.beforeRemoveSubscription) {
            this.beforeRemoveSubscription();
        }
    }

    render() {
        const maxHeight = this.props.shouldEnableMaxHeight ? this.props.windowHeight : undefined;

        return (
            <SafeAreaConsumer>
                {({insets, paddingTop, paddingBottom, safeAreaPaddingBottomStyle}) => {
                    const paddingStyle = {};

                    if (this.props.includePaddingTop) {
                        paddingStyle.paddingTop = paddingTop;
                    }

                    // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
                    if (this.props.includeSafeAreaPaddingBottom || this.props.network.isOffline) {
                        paddingStyle.paddingBottom = paddingBottom;
                    }

                    return (
                        <View
                            style={[...this.props.style, styles.flex1, paddingStyle]}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...(this.props.environment === CONST.ENVIRONMENT.DEV ? this.panResponder.panHandlers : {})}
                        >
                            <KeyboardAvoidingView
                                style={[styles.w100, styles.h100, {maxHeight}]}
                                behavior={this.props.keyboardAvoidingViewBehavior}
                                enabled={this.props.shouldEnableKeyboardAvoidingView}
                            >
                                <PickerAvoidingView
                                    style={styles.flex1}
                                    enabled={this.props.shouldEnablePickerAvoiding}
                                >
                                    <HeaderGap />
                                    {this.props.environment === CONST.ENVIRONMENT.DEV && <TestToolsModal />}
                                    {this.props.environment === CONST.ENVIRONMENT.DEV && <CustomDevMenu />}
                                    {
                                        // If props.children is a function, call it to provide the insets to the children.
                                        _.isFunction(this.props.children)
                                            ? this.props.children({
                                                  insets,
                                                  safeAreaPaddingBottomStyle,
                                                  didScreenTransitionEnd: this.state.didScreenTransitionEnd,
                                              })
                                            : this.props.children
                                    }
                                    {this.props.isSmallScreenWidth && this.props.shouldShowOfflineIndicator && <OfflineIndicator style={this.props.offlineIndicatorStyle} />}
                                </PickerAvoidingView>
                            </KeyboardAvoidingView>
                        </View>
                    );
                }}
            </SafeAreaConsumer>
        );
    }
}

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default compose(withNavigation, withEnvironment, withWindowDimensions, withKeyboardState, withNetwork())(ScreenWrapper);
