import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useIsFocused, useNavigation, usePreventRemove} from '@react-navigation/native';
import type {ForwardedRef, ReactNode} from 'react';
import React, {forwardRef, useContext, useEffect, useMemo, useState} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';
import {Keyboard} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import CustomDevMenu from '@components/CustomDevMenu';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FocusTrapForScreen from '@components/FocusTrap/FocusTrapForScreen';
import type FocusTrapForScreenProps from '@components/FocusTrap/FocusTrapForScreen/FocusTrapProps';
import HeaderGap from '@components/HeaderGap';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import withNavigationFallback from '@components/withNavigationFallback';
import useEnvironment from '@hooks/useEnvironment';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import NarrowPaneContext from '@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RootNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ScreenWrapperContainerProps} from './ScreenWrapperContainer';
import ScreenWrapperContainer from './ScreenWrapperContainer';
import ScreenWrapperOfflineIndicatorContext from './ScreenWrapperOfflineIndicatorContext';
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

type ScreenWrapperProps = Omit<ScreenWrapperContainerProps, 'children'> &
    Omit<ScreenWrapperOfflineIndicatorsProps, 'addBottomSafeAreaPadding' | 'addWideScreenBottomSafeAreaPadding'> & {
        /**
         * The navigation prop is passed by the navigator. It is used to trigger the onEntryTransitionEnd callback
         * when the screen transition ends.
         *
         * This is required because transitionEnd event doesn't trigger in the testing environment.
         */
        navigation?: PlatformStackNavigationProp<RootNavigatorParamList> | PlatformStackNavigationProp<ReportsSplitNavigatorParamList>;

        /** A unique ID to find the screen wrapper in tests */
        testID: string;

        /** Returns a function as a child to pass insets to or a node to render without insets */
        children: ReactNode | ((props: ScreenWrapperChildrenProps) => ReactNode);

        /** Additional styles to add */
        style?: StyleProp<ViewStyle>;

        /** Additional styles for header gap */
        headerGapStyles?: StyleProp<ViewStyle>;

        /** Whether to disable the safe area padding for (nested) offline indicators */
        disableOfflineIndicatorSafeAreaPadding?: boolean;

        /** Settings for the focus trap */
        focusTrapSettings?: FocusTrapForScreenProps['focusTrapSettings'];

        /** Called when navigated Screen's transition is finished. It does not fire when user exit the page. */
        onEntryTransitionEnd?: () => void;
    };

function ScreenWrapper(
    {
        navigation: navigationProp,
        children,
        style,
        bottomContent,
        headerGapStyles,
        offlineIndicatorStyle,
        disableOfflineIndicatorSafeAreaPadding,
        shouldShowOfflineIndicator: shouldShowSmallScreenOfflineIndicator,
        shouldShowOfflineIndicatorInWideScreen: shouldShowWideScreenOfflineIndicator,
        shouldMobileOfflineIndicatorStickToBottom: shouldSmallScreenOfflineIndicatorStickToBottomProp,
        shouldDismissKeyboardBeforeClose,
        onEntryTransitionEnd,
        includePaddingTop = true,
        includeSafeAreaPaddingBottom: includeSafeAreaPaddingBottomProp = true,
        enableEdgeToEdgeBottomSafeAreaPadding: enableEdgeToEdgeBottomSafeAreaPaddingProp,
        shouldKeyboardOffsetBottomSafeAreaPadding: shouldKeyboardOffsetBottomSafeAreaPaddingProp,
        isOfflineIndicatorTranslucent,
        focusTrapSettings,
        ...restContainerProps
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

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for a case where we want to show the offline indicator only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const styles = useThemeStyles();
    const {isDevelopment} = useEnvironment();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);

    // When the `enableEdgeToEdgeBottomSafeAreaPadding` prop is explicitly set, we enable edge-to-edge mode.
    const isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPaddingProp !== undefined;
    const enableEdgeToEdgeBottomSafeAreaPadding = enableEdgeToEdgeBottomSafeAreaPaddingProp ?? false;
    const {insets, safeAreaPaddingBottomStyle} = useSafeAreaPaddings(isUsingEdgeToEdgeMode);

    // We enable all of these flags by default, if we are using edge-to-edge mode.
    const shouldSmallScreenOfflineIndicatorStickToBottom = shouldSmallScreenOfflineIndicatorStickToBottomProp ?? isUsingEdgeToEdgeMode;
    const shouldKeyboardOffsetBottomSafeAreaPadding = shouldKeyboardOffsetBottomSafeAreaPaddingProp ?? isUsingEdgeToEdgeMode;

    // We disable legacy bottom safe area padding handling, if we are using edge-to-edge mode.
    const includeSafeAreaPaddingBottom = isUsingEdgeToEdgeMode ? false : includeSafeAreaPaddingBottomProp;
    const isSafeAreaTopPaddingApplied = includePaddingTop;
    const statusContextValue = useMemo(
        () => ({didScreenTransitionEnd, isSafeAreaTopPaddingApplied, isSafeAreaBottomPaddingApplied: includeSafeAreaPaddingBottom}),
        [didScreenTransitionEnd, includeSafeAreaPaddingBottom, isSafeAreaTopPaddingApplied],
    );

    // This context allows us to disable the safe area padding offsetting the offline indicator in scrollable components like 'ScrollView', 'SelectionList' or 'FormProvider'.
    // This is useful e.g. for the RightModalNavigator, where we want to avoid the safe area padding offsetting the offline indicator because we only show the offline indicator on small screens.
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
            addSafeAreaPadding: disableOfflineIndicatorSafeAreaPadding === undefined ? (newAddSafeAreaPadding ?? true) : !disableOfflineIndicatorSafeAreaPadding,
            // Prevent any nested ScreenWrapper components from rendering another offline indicator.
            showOnSmallScreens: false,
            showOnWideScreens: false,
            // Pass down the original values by the outermost ScreenWrapperOfflineIndicatorContext.Provider,
            // to allow nested ScreenWrapperOfflineIndicatorContext.Provider to access these values. (e.g. in Modals)
            originalValues: newOriginalValues,
        };
    }, [addSafeAreaPadding, disableOfflineIndicatorSafeAreaPadding, isInNarrowPane, isSmallScreenWidth, originalValues, showOnSmallScreens, showOnWideScreens]);

    /** If there is no bottom content, the mobile offline indicator will stick to the bottom of the screen by default. */
    const displayStickySmallScreenOfflineIndicator = shouldSmallScreenOfflineIndicatorStickToBottom && !bottomContent;
    const displaySmallScreenOfflineIndicator = isSmallScreenWidth && (shouldShowSmallScreenOfflineIndicator ?? showOnSmallScreens ?? true);
    const displayWideScreenOfflineIndicator = !shouldUseNarrowLayout && (shouldShowWideScreenOfflineIndicator ?? showOnWideScreens ?? false);

    /** In edge-to-edge mode, we always want to apply the bottom safe area padding to the mobile offline indicator. */
    const addSmallScreenOfflineIndicatorBottomSafeAreaPadding = isUsingEdgeToEdgeMode ? enableEdgeToEdgeBottomSafeAreaPadding : !includeSafeAreaPaddingBottom;

    /** If we currently show the offline indicator and it has bottom safe area padding, we need to offset the bottom safe area padding in the KeyboardAvoidingView. */
    const {isOffline} = useNetwork();
    const shouldOffsetMobileOfflineIndicator = displaySmallScreenOfflineIndicator && addSmallScreenOfflineIndicatorBottomSafeAreaPadding && isOffline;

    const {initialURL} = useContext(InitialURLContext);
    const [isSingleNewDotEntry] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY, {canBeMissing: true});
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);

    usePreventRemove((isSingleNewDotEntry ?? false) && initialURL === Navigation.getActiveRouteWithoutParams(), () => {
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

    const ChildrenContent = useMemo(() => {
        return (
            // If props.children is a function, call it to provide the insets to the children.
            typeof children === 'function' ? children({insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd}) : children
        );
    }, [children, insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd]);

    return (
        <FocusTrapForScreen focusTrapSettings={focusTrapSettings}>
            <ScreenWrapperContainer
                forwardedRef={ref}
                style={[styles.flex1, style]}
                bottomContent={bottomContent}
                didScreenTransitionEnd={didScreenTransitionEnd}
                shouldKeyboardOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding || shouldOffsetMobileOfflineIndicator}
                enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPaddingProp}
                includePaddingTop={includePaddingTop}
                includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
                isFocused={isFocused}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restContainerProps}
            >
                <HeaderGap styles={headerGapStyles} />
                {isDevelopment && <CustomDevMenu />}
                <ScreenWrapperStatusContext.Provider value={statusContextValue}>
                    <ScreenWrapperOfflineIndicatorContext.Provider value={offlineIndicatorContextValue}>
                        {ChildrenContent}

                        <ScreenWrapperOfflineIndicators
                            offlineIndicatorStyle={offlineIndicatorStyle}
                            shouldShowOfflineIndicator={displaySmallScreenOfflineIndicator}
                            shouldShowOfflineIndicatorInWideScreen={displayWideScreenOfflineIndicator}
                            shouldMobileOfflineIndicatorStickToBottom={displayStickySmallScreenOfflineIndicator}
                            isOfflineIndicatorTranslucent={isOfflineIndicatorTranslucent}
                            extraContent={bottomContent}
                            addBottomSafeAreaPadding={addSmallScreenOfflineIndicatorBottomSafeAreaPadding}
                        />
                    </ScreenWrapperOfflineIndicatorContext.Provider>
                </ScreenWrapperStatusContext.Provider>
            </ScreenWrapperContainer>
        </FocusTrapForScreen>
    );
}
ScreenWrapper.displayName = 'ScreenWrapper';

export default withNavigationFallback(forwardRef(ScreenWrapper));
export type {ScreenWrapperProps, ScreenWrapperChildrenProps};
