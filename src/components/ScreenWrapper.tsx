import {useIsFocused, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ForwardedRef, ReactNode} from 'react';
import React, {createContext, forwardRef, useEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Keyboard, PanResponder, View} from 'react-native';
import {PickerAvoidingView} from 'react-native-picker-select';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useEnvironment from '@hooks/useEnvironment';
import useInitialDimensions from '@hooks/useInitialWindowDimensions';
import useKeyboardState from '@hooks/useKeyboardState';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTackInputFocus from '@hooks/useTackInputFocus';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import type {AuthScreensParamList, RootStackParamList} from '@libs/Navigation/types';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import CustomDevMenu from './CustomDevMenu';
import FocusTrapForScreens from './FocusTrap/FocusTrapForScreen';
import type FocusTrapForScreenProps from './FocusTrap/FocusTrapForScreen/FocusTrapProps';
import HeaderGap from './HeaderGap';
import ImportedStateIndicator from './ImportedStateIndicator';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import OfflineIndicator from './OfflineIndicator';
import SafeAreaConsumer from './SafeAreaConsumer';
import TestToolsModal from './TestToolsModal';
import withNavigationFallback from './withNavigationFallback';

type ScreenWrapperChildrenProps = {
    insets: EdgeInsets;
    safeAreaPaddingBottomStyle?: {
        paddingBottom?: ViewStyle['paddingBottom'];
    };
    didScreenTransitionEnd: boolean;
};

type ScreenWrapperProps = {
    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: ReactNode | React.FC<ScreenWrapperChildrenProps>;

    /** A unique ID to find the screen wrapper in tests */
    testID: string;

    /** Additional styles to add */
    style?: StyleProp<ViewStyle>;

    /** Additional styles for header gap */
    headerGapStyles?: StyleProp<ViewStyle>;

    /** Styles for the offline indicator */
    offlineIndicatorStyle?: StyleProp<ViewStyle>;

    /** Whether to include padding bottom */
    includeSafeAreaPaddingBottom?: boolean;

    /** Whether to include padding top */
    includePaddingTop?: boolean;

    /** Called when navigated Screen's transition is finished. It does not fire when user exit the page. */
    onEntryTransitionEnd?: () => void;

    /** The behavior to pass to the KeyboardAvoidingView, requires some trial and error depending on the layout/devices used.
     *  Search 'switch(behavior)' in ./node_modules/react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js for more context */
    keyboardAvoidingViewBehavior?: 'padding' | 'height' | 'position';

    /** Whether KeyboardAvoidingView should be enabled. Use false for screens where this functionality is not necessary */
    shouldEnableKeyboardAvoidingView?: boolean;

    /** Whether picker modal avoiding should be enabled. Should be enabled when there's a picker at the bottom of a
     *  scrollable form, gives a subtly better UX if disabled on non-scrollable screens with a submit button */
    shouldEnablePickerAvoiding?: boolean;

    /** Whether to dismiss keyboard before leaving a screen */
    shouldDismissKeyboardBeforeClose?: boolean;

    /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
    shouldEnableMaxHeight?: boolean;

    /** Whether to use the minHeight. Use true for screens where the window height are changing because of Virtual Keyboard */
    shouldEnableMinHeight?: boolean;

    /** Whether to show offline indicator */
    shouldShowOfflineIndicator?: boolean;

    /** Whether to avoid scroll on virtual viewport */
    shouldAvoidScrollOnVirtualViewport?: boolean;

    /** Whether to use cached virtual viewport height  */
    shouldUseCachedViewportHeight?: boolean;

    /**
     * The navigation prop is passed by the navigator. It is used to trigger the onEntryTransitionEnd callback
     * when the screen transition ends.
     *
     * This is required because transitionEnd event doesn't trigger in the testing environment.
     */
    navigation?: StackNavigationProp<RootStackParamList> | StackNavigationProp<AuthScreensParamList>;

    /** Whether to show offline indicator on wide screens */
    shouldShowOfflineIndicatorInWideScreen?: boolean;

    /** Overrides the focus trap default settings */
    focusTrapSettings?: FocusTrapForScreenProps['focusTrapSettings'];
};

type ScreenWrapperStatusContextType = {didScreenTransitionEnd: boolean};

const ScreenWrapperStatusContext = createContext<ScreenWrapperStatusContextType | undefined>(undefined);

function ScreenWrapper(
    {
        shouldEnableMaxHeight = false,
        shouldEnableMinHeight = false,
        includePaddingTop = true,
        keyboardAvoidingViewBehavior = 'padding',
        includeSafeAreaPaddingBottom = true,
        shouldEnableKeyboardAvoidingView = true,
        shouldEnablePickerAvoiding = true,
        headerGapStyles,
        children,
        shouldShowOfflineIndicator = true,
        offlineIndicatorStyle,
        style,
        shouldDismissKeyboardBeforeClose = true,
        onEntryTransitionEnd,
        testID,
        navigation: navigationProp,
        shouldAvoidScrollOnVirtualViewport = true,
        shouldShowOfflineIndicatorInWideScreen = false,
        shouldUseCachedViewportHeight = false,
        focusTrapSettings,
    }: ScreenWrapperProps,
    ref: ForwardedRef<View>,
) {
    /**
     * We are only passing navigation as prop from
     * ReportScreen -> ScreenWrapper
     *
     * so in other places where ScreenWrapper is used, we need to
     * fallback to useNavigation.
     */
    const navigationFallback = useNavigation<StackNavigationProp<RootStackParamList>>();
    const navigation = navigationProp ?? navigationFallback;
    const isFocused = useIsFocused();
    const {windowHeight} = useWindowDimensions(shouldUseCachedViewportHeight);
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {initialHeight} = useInitialDimensions();
    const styles = useThemeStyles();
    const keyboardState = useKeyboardState();
    const {isDevelopment} = useEnvironment();
    const {isOffline} = useNetwork();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
    const minHeight = shouldEnableMinHeight && !Browser.isSafari() ? initialHeight : undefined;
    const isKeyboardShown = keyboardState?.isKeyboardShown ?? false;

    const isKeyboardShownRef = useRef<boolean>(false);

    isKeyboardShownRef.current = keyboardState?.isKeyboardShown ?? false;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: (_e, gestureState) => gestureState.numberActiveTouches === CONST.TEST_TOOL.NUMBER_OF_TAPS,
            onPanResponderRelease: toggleTestToolsModal,
        }),
    ).current;

    const keyboardDissmissPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (_e, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                const shouldDismissKeyboard = shouldDismissKeyboardBeforeClose && isKeyboardShown && Browser.isMobile();

                return isHorizontalSwipe && shouldDismissKeyboard;
            },
            onPanResponderGrant: Keyboard.dismiss,
        }),
    ).current;

    useEffect(() => {
        // On iOS, the transitionEnd event doesn't trigger some times. As such, we need to set a timeout
        const timeout = setTimeout(() => {
            setDidScreenTransitionEnd(true);
            onEntryTransitionEnd?.();
        }, CONST.SCREEN_TRANSITION_END_TIMEOUT);

        const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', (event) => {
            // Prevent firing the prop callback when user is exiting the page.
            if (event?.data?.closing) {
                return;
            }
            clearTimeout(timeout);
            setDidScreenTransitionEnd(true);
            onEntryTransitionEnd?.();
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
            clearTimeout(timeout);
            unsubscribeTransitionEnd();

            if (beforeRemoveSubscription) {
                beforeRemoveSubscription();
            }
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const isAvoidingViewportScroll = useTackInputFocus(isFocused && shouldEnableMaxHeight && shouldAvoidScrollOnVirtualViewport && Browser.isMobileWebKit());
    const contextValue = useMemo(() => ({didScreenTransitionEnd}), [didScreenTransitionEnd]);

    return (
        <SafeAreaConsumer>
            {({
                insets = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                paddingTop,
                paddingBottom,
                safeAreaPaddingBottomStyle,
            }) => {
                const paddingStyle: StyleProp<ViewStyle> = {};

                if (includePaddingTop) {
                    paddingStyle.paddingTop = paddingTop;
                }

                // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
                if (includeSafeAreaPaddingBottom || (isOffline && shouldShowOfflineIndicator)) {
                    paddingStyle.paddingBottom = paddingBottom;
                }

                return (
                    <FocusTrapForScreens focusTrapSettings={focusTrapSettings}>
                        <View
                            ref={ref}
                            style={[styles.flex1, {minHeight}]}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...panResponder.panHandlers}
                            testID={testID}
                        >
                            <View
                                fsClass="fs-unmask"
                                style={[styles.flex1, paddingStyle, style]}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...keyboardDissmissPanResponder.panHandlers}
                            >
                                <KeyboardAvoidingView
                                    style={[styles.w100, styles.h100, {maxHeight}, isAvoidingViewportScroll ? [styles.overflowAuto, styles.overscrollBehaviorContain] : {}]}
                                    behavior={keyboardAvoidingViewBehavior}
                                    enabled={shouldEnableKeyboardAvoidingView}
                                >
                                    <PickerAvoidingView
                                        style={isAvoidingViewportScroll ? [styles.h100, {marginTop: 1}] : styles.flex1}
                                        enabled={shouldEnablePickerAvoiding}
                                    >
                                        <HeaderGap styles={headerGapStyles} />
                                        <TestToolsModal />
                                        {isDevelopment && <CustomDevMenu />}
                                        <ScreenWrapperStatusContext.Provider value={contextValue}>
                                            {
                                                // If props.children is a function, call it to provide the insets to the children.
                                                typeof children === 'function'
                                                    ? children({
                                                          insets,
                                                          safeAreaPaddingBottomStyle,
                                                          didScreenTransitionEnd,
                                                      })
                                                    : children
                                            }
                                            {isSmallScreenWidth && shouldShowOfflineIndicator && (
                                                <>
                                                    <OfflineIndicator style={offlineIndicatorStyle} />
                                                    {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                                                    <ImportedStateIndicator />
                                                </>
                                            )}
                                            {!shouldUseNarrowLayout && shouldShowOfflineIndicatorInWideScreen && (
                                                <>
                                                    <OfflineIndicator
                                                        containerStyles={[]}
                                                        style={[styles.pl5, styles.offlineIndicatorRow, offlineIndicatorStyle]}
                                                    />
                                                    {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                                                    <ImportedStateIndicator />
                                                </>
                                            )}
                                        </ScreenWrapperStatusContext.Provider>
                                    </PickerAvoidingView>
                                </KeyboardAvoidingView>
                            </View>
                        </View>
                    </FocusTrapForScreens>
                );
            }}
        </SafeAreaConsumer>
    );
}

ScreenWrapper.displayName = 'ScreenWrapper';

export default withNavigationFallback(forwardRef(ScreenWrapper));
export {ScreenWrapperStatusContext};
export type {ScreenWrapperChildrenProps};
