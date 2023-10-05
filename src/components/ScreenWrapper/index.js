import {Keyboard, View, PanResponder} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {PickerAvoidingView} from 'react-native-picker-select';
import {useNavigation} from '@react-navigation/native';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import HeaderGap from '../HeaderGap';
import OfflineIndicator from '../OfflineIndicator';
import {propTypes, defaultProps} from './propTypes';
import SafeAreaConsumer from '../SafeAreaConsumer';
import TestToolsModal from '../TestToolsModal';
import toggleTestToolsModal from '../../libs/actions/TestTool';
import CustomDevMenu from '../CustomDevMenu';
import * as Browser from '../../libs/Browser';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useKeyboardState from '../../hooks/useKeyboardState';
import useEnvironment from '../../hooks/useEnvironment';
import useNetwork from '../../hooks/useNetwork';

function ScreenWrapper({
    shouldEnableMaxHeight,
    includePaddingTop,
    keyboardAvoidingViewBehavior,
    includeSafeAreaPaddingBottom,
    shouldEnableKeyboardAvoidingView,
    shouldEnablePickerAvoiding,
    headerGapStyles,
    children,
    shouldShowOfflineIndicator,
    offlineIndicatorStyle,
    style,
    shouldDismissKeyboardBeforeClose,
    onEntryTransitionEnd,
    testID,
}) {
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const keyboardState = useKeyboardState();
    const {isDevelopment} = useEnvironment();
    const {isOffline} = useNetwork();
    const navigation = useNavigation();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
    const isKeyboardShown = lodashGet(keyboardState, 'isKeyboardShown', false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: (e, gestureState) => gestureState.numberActiveTouches === CONST.TEST_TOOL.NUMBER_OF_TAPS,
            onPanResponderRelease: toggleTestToolsModal,
        }),
    ).current;

    const keyboardDissmissPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (e, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                const shouldDismissKeyboard = shouldDismissKeyboardBeforeClose && isKeyboardShown && Browser.isMobile();

                return isHorizontalSwipe && shouldDismissKeyboard;
            },
            onPanResponderGrant: Keyboard.dismiss,
        }),
    ).current;

    useEffect(() => {
        const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', (event) => {
            // Prevent firing the prop callback when user is exiting the page.
            if (lodashGet(event, 'data.closing')) {
                return;
            }

            setDidScreenTransitionEnd(true);
            onEntryTransitionEnd();
        });

        // We need to have this prop to remove keyboard before going away from the screen, to avoid previous screen look weird for a brief moment,
        // also we need to have generic control in future - to prevent closing keyboard for some rare cases in which beforeRemove has limitations
        // described here https://reactnavigation.org/docs/preventing-going-back/#limitations
        const beforeRemoveSubscription = shouldDismissKeyboardBeforeClose
            ? navigation.addListener('beforeRemove', () => {
                  if (!isKeyboardShown) {
                      return;
                  }
                  Keyboard.dismiss();
              })
            : undefined;

        return () => {
            unsubscribeTransitionEnd();

            if (beforeRemoveSubscription) {
                beforeRemoveSubscription();
            }
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SafeAreaConsumer>
            {({insets, paddingTop, paddingBottom, safeAreaPaddingBottomStyle}) => {
                const paddingStyle = {};

                if (includePaddingTop) {
                    paddingStyle.paddingTop = paddingTop;
                }

                // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
                if (includeSafeAreaPaddingBottom || isOffline) {
                    paddingStyle.paddingBottom = paddingBottom;
                }

                return (
                    <View
                        style={styles.flex1}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(isDevelopment ? panResponder.panHandlers : {})}
                        testID={testID}
                    >
                        <View
                            style={[styles.flex1, paddingStyle, ...style]}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...keyboardDissmissPanResponder.panHandlers}
                        >
                            <KeyboardAvoidingView
                                style={[styles.w100, styles.h100, {maxHeight}]}
                                behavior={keyboardAvoidingViewBehavior}
                                enabled={shouldEnableKeyboardAvoidingView}
                            >
                                <PickerAvoidingView
                                    style={styles.flex1}
                                    enabled={shouldEnablePickerAvoiding}
                                >
                                    <HeaderGap styles={headerGapStyles} />
                                    {isDevelopment && <TestToolsModal />}
                                    {isDevelopment && <CustomDevMenu />}
                                    {
                                        // If props.children is a function, call it to provide the insets to the children.
                                        _.isFunction(children)
                                            ? children({
                                                  insets,
                                                  safeAreaPaddingBottomStyle,
                                                  didScreenTransitionEnd,
                                              })
                                            : children
                                    }
                                    {isSmallScreenWidth && shouldShowOfflineIndicator && <OfflineIndicator style={offlineIndicatorStyle} />}
                                </PickerAvoidingView>
                            </KeyboardAvoidingView>
                        </View>
                    </View>
                );
            }}
        </SafeAreaConsumer>
    );
}

ScreenWrapper.displayName = 'ScreenWrapper';
ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default ScreenWrapper;
