import {useNavigation} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import React, {useEffect, useRef, useState} from 'react';
import {Keyboard, PanResponder, View} from 'react-native';
import {PickerAvoidingView} from 'react-native-picker-select';
import _ from 'underscore';
import CustomDevMenu from '@components/CustomDevMenu';
import HeaderGap from '@components/HeaderGap';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import TestToolsModal from '@components/TestToolsModal';
import useEnvironment from '@hooks/useEnvironment';
import useInitialDimensions from '@hooks/useInitialWindowDimensions';
import useKeyboardState from '@hooks/useKeyboardState';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import styles from '@styles/styles';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './propTypes';

const ScreenWrapper = React.forwardRef(
    (
        {
            shouldEnableMaxHeight,
            shouldEnableMinHeight,
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
        },
        ref,
    ) => {
        const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
        const {initialHeight} = useInitialDimensions();
        const keyboardState = useKeyboardState();
        const {isDevelopment} = useEnvironment();
        const {isOffline} = useNetwork();
        const navigation = useNavigation();
        const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
        const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
        const minHeight = shouldEnableMinHeight ? initialHeight : undefined;
        const isKeyboardShown = lodashGet(keyboardState, 'isKeyboardShown', false);

        const isKeyboardShownRef = useRef();

        isKeyboardShownRef.current = lodashGet(keyboardState, 'isKeyboardShown', false);

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
                      if (!isKeyboardShownRef.current) {
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
                    if (includeSafeAreaPaddingBottom || (isOffline && shouldShowOfflineIndicator)) {
                        paddingStyle.paddingBottom = paddingBottom;
                    }

                    return (
                        <View
                            ref={ref}
                            style={[styles.flex1, {minHeight}]}
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
    },
);

ScreenWrapper.displayName = 'ScreenWrapper';
ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default ScreenWrapper;
