import HybridAppModule from '@expensify/react-native-hybrid-app';
import {UNSTABLE_usePreventRemove, useIsFocused, useNavigation} from '@react-navigation/native';
import type {ForwardedRef, ReactNode} from 'react';
import React, {createContext, forwardRef, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Keyboard, PanResponder, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {PickerAvoidingView} from 'react-native-picker-select';
import type {EdgeInsets} from 'react-native-safe-area-context';
import CustomDevMenu from '@components/CustomDevMenu';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import type FocusTrapForScreenProps from '@components/FocusTrap/FocusTrapForScreen/FocusTrapProps';
import HeaderGap from '@components/HeaderGap';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import {useInputBlurContext} from '@components/InputBlurContext';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import ModalContext from '@components/Modal/ModalContext';
import OfflineIndicator from '@components/OfflineIndicator';
import withNavigationFallback from '@components/withNavigationFallback';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useEnvironment from '@hooks/useEnvironment';
import useInitialDimensions from '@hooks/useInitialWindowDimensions';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTackInputFocus from '@hooks/useTackInputFocus';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobile, isMobileWebKit, isSafari} from '@libs/Browser';
import NarrowPaneContext from '@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RootNavigatorParamList} from '@libs/Navigation/types';
import addViewportResizeListener from '@libs/VisualViewport';
import toggleTestToolsModal from '@userActions/TestTool';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ScreenWrapperOfflineIndicatorContext from './ScreenWrapperOfflineIndicatorContext';

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

    /** Content to display under the offline indicator */
    bottomContent?: ReactNode;

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

    /** The vertical offset to pass to the KeyboardAvoidingView */
    keyboardVerticalOffset?: number;

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

    /** Whether to disable the safe area padding for (nested) offline indicators */
    disableOfflineIndicatorSafeAreaPadding?: boolean;

    /** Whether to show offline indicator on small screens */
    shouldShowOfflineIndicator?: boolean;

    /** Whether to show offline indicator on wide screens */
    shouldShowOfflineIndicatorInWideScreen?: boolean;

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
    navigation?: PlatformStackNavigationProp<RootNavigatorParamList> | PlatformStackNavigationProp<ReportsSplitNavigatorParamList>;

    /** Overrides the focus trap default settings */
    focusTrapSettings?: FocusTrapForScreenProps['focusTrapSettings'];

    /**
     * Temporary flag to disable safe area bottom spacing in the ScreenWrapper and to allow edge-to-edge content
     * The ScreenWrapper should not always apply bottom safe area padding, instead it should be applied to the scrollable/bottom-docked content directly.
     * This flag can be removed, once all components/screens have switched to edge-to-edge safe area handling.
     */
    enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

    /**
     * Whether the KeyboardAvoidingView should compensate for the bottom safe area padding.
     * The KeyboardAvoidingView will use a negative keyboardVerticalOffset.
     */
    shouldKeyboardOffsetBottomSafeAreaPadding?: boolean;

    /** Whether to use a sticky mobile offline indicator. */
    shouldMobileOfflineIndicatorStickToBottom?: boolean;

    /** Whether the offline indicator should be translucent. */
    isOfflineIndicatorTranslucent?: boolean;
};

type ScreenWrapperStatusContextType = {
    didScreenTransitionEnd: boolean;
    isSafeAreaTopPaddingApplied: boolean;
    isSafeAreaBottomPaddingApplied: boolean;
};

const ScreenWrapperStatusContext = createContext<ScreenWrapperStatusContextType | undefined>(undefined);

function ScreenWrapper(
    {
        shouldEnableMaxHeight = false,
        shouldEnableMinHeight = false,
        includePaddingTop = true,
        keyboardAvoidingViewBehavior = 'padding',
        keyboardVerticalOffset,
        includeSafeAreaPaddingBottom: includeSafeAreaPaddingBottomProp = true,
        shouldEnableKeyboardAvoidingView = true,
        shouldEnablePickerAvoiding = true,
        headerGapStyles,
        children,
        disableOfflineIndicatorSafeAreaPadding,
        shouldShowOfflineIndicatorInWideScreen,
        shouldShowOfflineIndicator,
        offlineIndicatorStyle,
        style,
        shouldDismissKeyboardBeforeClose = true,
        onEntryTransitionEnd,
        testID,
        navigation: navigationProp,
        shouldAvoidScrollOnVirtualViewport = true,
        shouldUseCachedViewportHeight = false,
        focusTrapSettings,
        bottomContent,
        enableEdgeToEdgeBottomSafeAreaPadding: enableEdgeToEdgeBottomSafeAreaPaddingProp,
        shouldMobileOfflineIndicatorStickToBottom: shouldMobileOfflineIndicatorStickToBottomProp,
        shouldKeyboardOffsetBottomSafeAreaPadding: shouldKeyboardOffsetBottomSafeAreaPaddingProp,
        isOfflineIndicatorTranslucent = false,
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
    const navigationFallback = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const navigation = navigationProp ?? navigationFallback;
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const {windowHeight} = useWindowDimensions(shouldUseCachedViewportHeight);
    // since Modals are drawn in separate native view hierarchy we should always add paddings
    const ignoreInsetsConsumption = !useContext(ModalContext).default;
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);
    const {initialURL} = useContext(InitialURLContext);

    const [isSingleNewDotEntry] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY, {canBeMissing: true});

    // When the `enableEdgeToEdgeBottomSafeAreaPadding` prop is explicitly set, we enable edge-to-edge mode.
    const isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPaddingProp !== undefined;
    const enableEdgeToEdgeBottomSafeAreaPadding = enableEdgeToEdgeBottomSafeAreaPaddingProp ?? false;

    // We enable all of these flags by default, if we are using edge-to-edge mode.
    const shouldMobileOfflineIndicatorStickToBottom = shouldMobileOfflineIndicatorStickToBottomProp ?? isUsingEdgeToEdgeMode;
    const shouldKeyboardOffsetBottomSafeAreaPadding = shouldKeyboardOffsetBottomSafeAreaPaddingProp ?? isUsingEdgeToEdgeMode;

    // We disable legacy bottom safe area padding handling, if we are using edge-to-edge mode.
    const includeSafeAreaPaddingBottom = isUsingEdgeToEdgeMode ? false : includeSafeAreaPaddingBottomProp;

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for a case where we want to show the offline indicator only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {initialHeight} = useInitialDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isDevelopment} = useEnvironment();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
    const minHeight = shouldEnableMinHeight && !isSafari() ? initialHeight : undefined;

    const {isBlurred, setIsBlurred} = useInputBlurContext();

    UNSTABLE_usePreventRemove((isSingleNewDotEntry ?? false) && initialURL === Navigation.getActiveRouteWithoutParams(), () => {
        if (!CONFIG.IS_HYBRID_APP) {
            return;
        }
        HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: false});
        setRootStatusBarEnabled(false);
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: (_e, gestureState) => gestureState.numberActiveTouches === CONST.TEST_TOOL.NUMBER_OF_TAPS,
            onPanResponderRelease: toggleTestToolsModal,
        }),
    ).current;

    const keyboardDismissPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (_e, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                const shouldDismissKeyboard = shouldDismissKeyboardBeforeClose && Keyboard.isVisible() && isMobile();

                return isHorizontalSwipe && shouldDismissKeyboard;
            },
            onPanResponderGrant: Keyboard.dismiss,
        }),
    ).current;

    useEffect(() => {
        /**
         * Handler to manage viewport resize events specific to Safari.
         * Disables the blur state when Safari is detected.
         */
        const handleViewportResize = () => {
            if (!isSafari()) {
                return; // Exit early if not Safari
            }
            setIsBlurred(false); // Disable blur state for Safari
        };

        // Add the viewport resize listener
        const removeResizeListener = addViewportResizeListener(handleViewportResize);

        // Cleanup function to remove the listener
        return () => {
            removeResizeListener();
        };
    }, [setIsBlurred]);

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
                  if (!Keyboard.isVisible()) {
                      return;
                  }
                  Keyboard.dismiss();
              })
            : undefined;

        return () => {
            clearTimeout(timeout);
            if (unsubscribeTransitionEnd) {
                unsubscribeTransitionEnd();
            }

            if (beforeRemoveSubscription) {
                beforeRemoveSubscription();
            }
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const {insets, paddingTop, paddingBottom, safeAreaPaddingBottomStyle, unmodifiedPaddings} = useSafeAreaPaddings(isUsingEdgeToEdgeMode);
    const navigationBarType = useMemo(() => StyleUtils.getNavigationBarType(insets), [StyleUtils, insets]);
    const isSoftKeyNavigation = navigationBarType === CONST.NAVIGATION_BAR_TYPE.SOFT_KEYS;

    const isSafeAreaTopPaddingApplied = includePaddingTop;
    const paddingTopStyle: StyleProp<ViewStyle> = useMemo(() => {
        if (!includePaddingTop) {
            return {};
        }
        if (isUsingEdgeToEdgeMode) {
            return {paddingTop};
        }
        if (ignoreInsetsConsumption) {
            return {paddingTop: unmodifiedPaddings.top};
        }
        return {paddingTop};
    }, [isUsingEdgeToEdgeMode, ignoreInsetsConsumption, includePaddingTop, paddingTop, unmodifiedPaddings.top]);

    const showBottomContent = isUsingEdgeToEdgeMode ? !!bottomContent : true;
    const edgeToEdgeBottomContentStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false});
    const legacyBottomContentStyle: StyleProp<ViewStyle> = useMemo(() => {
        const shouldUseUnmodifiedPaddings = includeSafeAreaPaddingBottom && ignoreInsetsConsumption;
        if (shouldUseUnmodifiedPaddings) {
            return {
                paddingBottom: unmodifiedPaddings.bottom,
            };
        }

        return {
            // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
            paddingBottom: includeSafeAreaPaddingBottom ? paddingBottom : undefined,
        };
    }, [ignoreInsetsConsumption, includeSafeAreaPaddingBottom, paddingBottom, unmodifiedPaddings.bottom]);

    const bottomContentStyle = useMemo(
        () => (isUsingEdgeToEdgeMode ? edgeToEdgeBottomContentStyle : legacyBottomContentStyle),
        [isUsingEdgeToEdgeMode, edgeToEdgeBottomContentStyle, legacyBottomContentStyle],
    );

    /**
     * This style applies the background color of the mobile offline indicator.
     * When there is not bottom content, and the device either has soft keys or is offline,
     * the background style is applied.
     * By default, the background color of the mobile offline indicator is opaque.
     * If `isOfflineIndicatorTranslucent` is set to true, a translucent background color is applied.
     */
    const smallScreenOfflineIndicatorBackgroundStyle = useMemo(() => {
        const showOfflineIndicatorBackground = !bottomContent && isOffline;
        if (!showOfflineIndicatorBackground) {
            return undefined;
        }
        return isOfflineIndicatorTranslucent ? styles.translucentNavigationBarBG : styles.appBG;
    }, [bottomContent, isOffline, isOfflineIndicatorTranslucent, styles.appBG, styles.translucentNavigationBarBG]);

    /** In edge-to-edge mode, we always want to apply the bottom safe area padding to the mobile offline indicator. */
    const hasSmallScreenOfflineIndicatorBottomSafeAreaPadding = isUsingEdgeToEdgeMode ? enableEdgeToEdgeBottomSafeAreaPadding : !includeSafeAreaPaddingBottom;

    /**
     * This style includes the bottom safe area padding for the mobile offline indicator.
     * If the device has soft keys, the mobile offline indicator will stick to the navigation bar (bottom of the screen)
     * The mobile offline indicator container will have a translucent background. Therefore, we want to offset it
     * by the bottom safe area padding rather than adding padding to the container, so that there are not
     * two overlapping layers of translucent background.
     * If the device does not have soft keys, the bottom safe area padding is applied as `paddingBottom`.
     */
    const smallScreenOfflineIndicatorBottomSafeAreaStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: hasSmallScreenOfflineIndicatorBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        styleProperty: isSoftKeyNavigation ? 'bottom' : 'paddingBottom',
    });

    /** If there is no bottom content, the mobile offline indicator will stick to the bottom of the screen by default. */
    const displayStickySmallScreenOfflineIndicator = shouldMobileOfflineIndicatorStickToBottom && !bottomContent;

    /**
     * This style includes all styles applied to the container of the offline indicator on small screens.
     * It always applies the bottom safe area padding as well as the background style, if the device has soft keys.
     * In this case, we want the whole container (including the bottom safe area padding) to have translucent/opaque background.
     */
    const smallScreenOfflineIndicatorContainerStyle = useMemo(
        () => [
            smallScreenOfflineIndicatorBottomSafeAreaStyle,
            displayStickySmallScreenOfflineIndicator && styles.stickToBottom,
            !isSoftKeyNavigation && smallScreenOfflineIndicatorBackgroundStyle,
        ],
        [smallScreenOfflineIndicatorBottomSafeAreaStyle, displayStickySmallScreenOfflineIndicator, styles.stickToBottom, isSoftKeyNavigation, smallScreenOfflineIndicatorBackgroundStyle],
    );

    /**
     * This style includes the styles applied to the offline indicator component on small screens.
     * If the device has soft keys, we only want to apply the background style to the offline indicator component,
     * rather than the whole container, because otherwise the navigation bar would be extra opaque, since it already has a translucent background.
     */
    const smallScreenOfflineIndicatorStyle = useMemo(
        () => [styles.pl5, isSoftKeyNavigation && smallScreenOfflineIndicatorBackgroundStyle, offlineIndicatorStyle],
        [isSoftKeyNavigation, smallScreenOfflineIndicatorBackgroundStyle, offlineIndicatorStyle, styles.pl5],
    );

    // This context allows us to disable the safe area padding offseting the offline indicator in scrollable components like 'ScrollView', 'SelectionList' or 'FormProvider'.
    // This is useful e.g. for the RightModalNavigator, where we want to avoid the safe area padding offseting the offline indicator because we only show the offline indicator on small screens.
    const {isInNarrowPane} = useContext(NarrowPaneContext);
    const {addSafeAreaPadding, showOnSmallScreens, showOnWideScreens, originalValues} = useContext(ScreenWrapperOfflineIndicatorContext);
    const offlineIndicatorContextValue = useMemo(() => {
        const newAddSafeAreaPadding = isInNarrowPane ? isSmallScreenWidth : addSafeAreaPadding;

        const newOriginalValues = originalValues ?? {
            addSafeAreaPadding: newAddSafeAreaPadding,
            showOnSmallScreens,
            showOnWideScreens,
        };

        return {
            // Allows for individual screens to disable the offline indicator safe area padding for the screen and all nested ScreenWrapper components.
            addSafeAreaPadding: disableOfflineIndicatorSafeAreaPadding === undefined ? newAddSafeAreaPadding ?? true : !disableOfflineIndicatorSafeAreaPadding,
            // Prevent any nested ScreenWrapper components from rendering another offline indicator.
            showOnSmallScreens: false,
            showOnWideScreens: false,
            // Pass down the original values by the outermost ScreenWrapperOfflineIndicatorContext.Provider,
            // to allow nested ScreenWrapperOfflineIndicatorContext.Provider to access these values. (e.g. in Modals)
            originalValues: newOriginalValues,
        };
    }, [addSafeAreaPadding, disableOfflineIndicatorSafeAreaPadding, isInNarrowPane, isSmallScreenWidth, originalValues, showOnSmallScreens, showOnWideScreens]);

    const displaySmallScreenOfflineIndicator = isSmallScreenWidth && (shouldShowOfflineIndicator ?? showOnSmallScreens ?? true);
    const displayWidescreenOfflineIndicator = !shouldUseNarrowLayout && (shouldShowOfflineIndicatorInWideScreen ?? showOnWideScreens ?? false);

    /** If we currently show the offline indicator and it has bottom safe area padding, we need to offset the bottom safe area padding in the KeyboardAvoidingView. */
    const shouldOffsetMobileOfflineIndicator = displaySmallScreenOfflineIndicator && hasSmallScreenOfflineIndicatorBottomSafeAreaPadding && isOffline;

    const isAvoidingViewportScroll = useTackInputFocus(isFocused && shouldEnableMaxHeight && shouldAvoidScrollOnVirtualViewport && isMobileWebKit());

    const statusContextValue = useMemo(
        () => ({didScreenTransitionEnd, isSafeAreaTopPaddingApplied, isSafeAreaBottomPaddingApplied: includeSafeAreaPaddingBottom}),
        [didScreenTransitionEnd, includeSafeAreaPaddingBottom, isSafeAreaTopPaddingApplied],
    );

    return (
        <FocusTrapForScreens focusTrapSettings={focusTrapSettings}>
            <View
                ref={ref}
                style={[styles.flex1, {minHeight}]}
                // eslint-disable-next-line react/jsx-props-no-spreading, react-compiler/react-compiler
                {...panResponder.panHandlers}
                testID={testID}
            >
                <View
                    fsClass="fs-unmask"
                    style={[styles.flex1, paddingTopStyle, style]}
                    // eslint-disable-next-line react/jsx-props-no-spreading, react-compiler/react-compiler
                    {...keyboardDismissPanResponder.panHandlers}
                >
                    <KeyboardAvoidingView
                        style={[styles.w100, styles.h100, !isBlurred ? {maxHeight} : undefined, isAvoidingViewportScroll ? [styles.overflowAuto, styles.overscrollBehaviorContain] : {}]}
                        behavior={keyboardAvoidingViewBehavior}
                        enabled={shouldEnableKeyboardAvoidingView}
                        // Whether the mobile offline indicator or the content in general
                        // should be offset by the bottom safe area padding when the keyboard is open.
                        shouldOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding || shouldOffsetMobileOfflineIndicator}
                        keyboardVerticalOffset={keyboardVerticalOffset}
                    >
                        <PickerAvoidingView
                            style={isAvoidingViewportScroll ? [styles.h100, {marginTop: 1}] : styles.flex1}
                            enabled={shouldEnablePickerAvoiding}
                        >
                            <HeaderGap styles={headerGapStyles} />
                            {isDevelopment && <CustomDevMenu />}
                            <ScreenWrapperStatusContext.Provider value={statusContextValue}>
                                <ScreenWrapperOfflineIndicatorContext.Provider value={offlineIndicatorContextValue}>
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
                                    {displaySmallScreenOfflineIndicator && (
                                        <>
                                            {isOffline && (
                                                <View style={[smallScreenOfflineIndicatorContainerStyle]}>
                                                    <OfflineIndicator style={smallScreenOfflineIndicatorStyle} />
                                                    {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                                                </View>
                                            )}
                                            <ImportedStateIndicator />
                                        </>
                                    )}
                                    {displayWidescreenOfflineIndicator && (
                                        <>
                                            <OfflineIndicator
                                                style={[styles.pl5, offlineIndicatorStyle]}
                                                addBottomSafeAreaPadding={isUsingEdgeToEdgeMode ? !bottomContent : true}
                                            />
                                            {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                                            <ImportedStateIndicator />
                                        </>
                                    )}
                                </ScreenWrapperOfflineIndicatorContext.Provider>
                            </ScreenWrapperStatusContext.Provider>
                        </PickerAvoidingView>
                    </KeyboardAvoidingView>
                </View>
                {showBottomContent && <View style={bottomContentStyle}>{bottomContent}</View>}
            </View>
        </FocusTrapForScreens>
    );
}

ScreenWrapper.displayName = 'ScreenWrapper';

export default withNavigationFallback(forwardRef(ScreenWrapper));
export {ScreenWrapperStatusContext};
export type {ScreenWrapperChildrenProps};
