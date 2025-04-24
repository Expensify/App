import HybridAppModule from '@expensify/react-native-hybrid-app';
import {UNSTABLE_usePreventRemove, useNavigation} from '@react-navigation/native';
import type {ForwardedRef, ReactNode} from 'react';
import React, {forwardRef, useContext, useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import type {StyleProp, View, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import CustomDevMenu from '@components/CustomDevMenu';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import HeaderGap from '@components/HeaderGap';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import ModalContext from '@components/Modal/ModalContext';
import withNavigationFallback from '@components/withNavigationFallback';
import useEnvironment from '@hooks/useEnvironment';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RootNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ScreenWrapperContainerProps} from './ScreenWrapperContainer';
import ScreenWrapperContainer from './ScreenWrapperContainer';
import type {ScreenWrapperOfflineIndicatorsProps} from './ScreenWrapperOfflineIndicators';
import ScreenWrapperOfflineIndicators from './ScreenWrapperOfflineIndicators';
import ScreenWrapperStatusContext from './ScreenWrapperStatusContext';

type ScreenWrapperChildrenProps = {
    insets: EdgeInsets;
    safeAreaPaddingBottomStyle?: {
        paddingBottom?: ViewStyle['paddingBottom'];
    };
    didScreenTransitionEnd: boolean;
};

type ScreenWrapperProps = ScreenWrapperContainerProps &
    Omit<ScreenWrapperOfflineIndicatorsProps, 'isExtraContentVisible' | 'addBottomSafeAreaPadding' | 'addWideScreenBottomSafeAreaPadding'> & {
        /** A unique ID to find the screen wrapper in tests */
        testID: string;

        /** Returns a function as a child to pass insets to or a node to render without insets */
        children: ReactNode | React.FC<ScreenWrapperChildrenProps>;

        /** Additional styles to add */
        style?: StyleProp<ViewStyle>;

        /** Additional styles for header gap */
        headerGapStyles?: StyleProp<ViewStyle>;

        /**
         * Temporary flag to disable safe area bottom spacing in the ScreenWrapper and to allow edge-to-edge content
         * The ScreenWrapper should not always apply bottom safe area padding, instead it should be applied to the scrollable/bottom-docked content directly.
         * This flag can be removed, once all components/screens have switched to edge-to-edge safe area handling.
         */
        enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

        /** Whether to include padding bottom */
        includeSafeAreaPaddingBottom?: boolean;

        /** Whether to include padding top */
        includePaddingTop?: boolean;

        /** Called when navigated Screen's transition is finished. It does not fire when user exit the page. */
        onEntryTransitionEnd?: () => void;

        /**
         * The navigation prop is passed by the navigator. It is used to trigger the onEntryTransitionEnd callback
         * when the screen transition ends.
         *
         * This is required because transitionEnd event doesn't trigger in the testing environment.
         */
        navigation?: PlatformStackNavigationProp<RootNavigatorParamList> | PlatformStackNavigationProp<ReportsSplitNavigatorParamList>;
    };

function ScreenWrapper(
    {
        children,
        style,
        testID,
        navigation: navigationProp,
        extraContent,
        extraContentStyle,
        headerGapStyles,
        shouldShowOfflineIndicator,
        shouldShowOfflineIndicatorInWideScreen,
        offlineIndicatorStyle,
        keyboardAvoidingViewBehavior,
        keyboardVerticalOffset,
        shouldEnableMaxHeight,
        shouldEnableMinHeight,
        shouldEnableKeyboardAvoidingView,
        shouldEnablePickerAvoiding,
        shouldDismissKeyboardBeforeClose,
        shouldAvoidScrollOnVirtualViewport,
        shouldUseCachedViewportHeight,
        onEntryTransitionEnd,
        includePaddingTop = true,
        includeSafeAreaPaddingBottom: includeSafeAreaPaddingBottomProp = true,
        enableEdgeToEdgeBottomSafeAreaPadding: enableEdgeToEdgeBottomSafeAreaPaddingProp,
        shouldMobileOfflineIndicatorStickToBottom: shouldMobileOfflineIndicatorStickToBottomProp,
        shouldKeyboardOffsetBottomSafeAreaPadding: shouldKeyboardOffsetBottomSafeAreaPaddingProp,
        isOfflineIndicatorTranslucent,
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
    const {isOffline} = useNetwork();
    // since Modals are drawn in separate native view hierarchy we should always add paddings
    const ignoreInsetsConsumption = !useContext(ModalContext).default;
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);
    const {initialURL} = useContext(InitialURLContext);

    const [isSingleNewDotEntry] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY);

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
    const styles = useThemeStyles();
    const {isDevelopment} = useEnvironment();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);

    UNSTABLE_usePreventRemove((isSingleNewDotEntry ?? false) && initialURL === Navigation.getActiveRouteWithoutParams(), () => {
        if (!CONFIG.IS_HYBRID_APP) {
            return;
        }
        HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: false});
        setRootStatusBarEnabled(false);
    });

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

    const {insets, paddingTop, safeAreaPaddingBottomStyle, unmodifiedPaddings} = useSafeAreaPaddings(isUsingEdgeToEdgeMode);

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

    /** In edge-to-edge mode, we always want to apply the bottom safe area padding to the mobile offline indicator. */
    const hasMobileOfflineIndicatorBottomSafeAreaPadding = isUsingEdgeToEdgeMode ? enableEdgeToEdgeBottomSafeAreaPadding : !includeSafeAreaPaddingBottom;

    /** If there is no bottom content, the mobile offline indicator will stick to the bottom of the screen by default. */
    const displayStickyMobileOfflineIndicator = shouldMobileOfflineIndicatorStickToBottom && !extraContent;

    const displayMobileOfflineIndicator = isSmallScreenWidth && shouldShowOfflineIndicator;
    const displayWidescreenOfflineIndicator = !shouldUseNarrowLayout && shouldShowOfflineIndicatorInWideScreen;

    /** If we currently show the offline indicator and it has bottom safe area padding, we need to offset the bottom safe area padding in the KeyboardAvoidingView. */
    const shouldOffsetMobileOfflineIndicator = displayMobileOfflineIndicator && hasMobileOfflineIndicatorBottomSafeAreaPadding && isOffline;

    const contextValue = useMemo(
        () => ({didScreenTransitionEnd, isSafeAreaTopPaddingApplied, isSafeAreaBottomPaddingApplied: includeSafeAreaPaddingBottom}),
        [didScreenTransitionEnd, includeSafeAreaPaddingBottom, isSafeAreaTopPaddingApplied],
    );

    return (
        <ScreenWrapperContainer
            forwardedRef={ref}
            style={[styles.flex1, paddingTopStyle, style]}
            testID={testID}
            extraContent={extraContent}
            extraContentStyle={extraContentStyle}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
            shouldEnableMinHeight={shouldEnableMinHeight}
            keyboardAvoidingViewBehavior={keyboardAvoidingViewBehavior}
            keyboardVerticalOffset={keyboardVerticalOffset}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            shouldEnablePickerAvoiding={shouldEnablePickerAvoiding}
            shouldDismissKeyboardBeforeClose={shouldDismissKeyboardBeforeClose}
            shouldAvoidScrollOnVirtualViewport={shouldAvoidScrollOnVirtualViewport}
            shouldUseCachedViewportHeight={shouldUseCachedViewportHeight}
            shouldKeyboardOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding || shouldOffsetMobileOfflineIndicator}
        >
            <HeaderGap styles={headerGapStyles} />
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

                <ScreenWrapperOfflineIndicators
                    offlineIndicatorStyle={offlineIndicatorStyle}
                    shouldShowOfflineIndicator={displayMobileOfflineIndicator}
                    shouldShowOfflineIndicatorInWideScreen={displayWidescreenOfflineIndicator}
                    shouldMobileOfflineIndicatorStickToBottom={displayStickyMobileOfflineIndicator}
                    isOfflineIndicatorTranslucent={isOfflineIndicatorTranslucent}
                    extraContent={extraContent}
                    addBottomSafeAreaPadding={hasMobileOfflineIndicatorBottomSafeAreaPadding}
                />
            </ScreenWrapperStatusContext.Provider>
        </ScreenWrapperContainer>
    );
}
ScreenWrapper.displayName = 'ScreenWrapper';

export default withNavigationFallback(forwardRef(ScreenWrapper));
export type {ScreenWrapperProps};
