import FSClassContext from '@components/FSClassView/FSClassContext';
import {useInputBlurActions, useInputBlurState} from '@components/InputBlurContext';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import ModalContext from '@components/Modal/ModalContext';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useHeightWithoutKeyboard from '@hooks/useHeightWithoutKeyboard';
import useIsLandscapeKeyboardOpen from '@hooks/useIsLandscapeKeyboardOpen';
import useRevealFocusedInputOnResize from '@hooks/useRevealFocusedInputOnResize';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTackInputFocus from '@hooks/useTackInputFocus';
import useTestToolsTapResponder from '@hooks/useTestToolsTapResponder';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {isMobile, isMobileWebKit, isSafari} from '@libs/Browser';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import addViewportResizeListener from '@libs/VisualViewport';

import CONST from '@src/CONST';

import type {ComponentRef, ForwardedRef, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useContext, useEffect, useState} from 'react';
import {Keyboard, PanResponder, View} from 'react-native';
import {PickerAvoidingView} from 'react-native-picker-select';

type ScreenWrapperContainerProps = ForwardedFSClassProps &
    React.PropsWithChildren<{
        testID: string;
        style?: StyleProp<ViewStyle>;

        /** Content to display under the offline indicator */
        bottomContent?: ReactNode;

        bottomContentStyle?: StyleProp<ViewStyle>;

        /** Whether the screen wrapper has finished the transition */
        didScreenTransitionEnd?: boolean;

        /** The behavior to pass to the KeyboardAvoidingView, requires some trial and error depending on the layout/devices used.
         *  Search 'switch(behavior)' in ./node_modules/react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js for more context */
        keyboardAvoidingViewBehavior?: 'padding' | 'height' | 'position';

        keyboardVerticalOffset?: number;

        /** Whether KeyboardAvoidingView should be enabled. Use false for screens where this functionality is not necessary */
        shouldEnableKeyboardAvoidingView?: boolean;

        /** Whether picker modal avoiding should be enabled. Should be enabled when there's a picker at the bottom of a
         *  scrollable form, gives a subtly better UX if disabled on non-scrollable screens with a submit button */
        shouldEnablePickerAvoiding?: boolean;

        /**
         * Whether the KeyboardAvoidingView should compensate for the bottom safe area padding.
         * The KeyboardAvoidingView will use a negative keyboardVerticalOffset.
         */
        shouldKeyboardOffsetBottomSafeAreaPadding?: boolean;

        /** Whether to dismiss keyboard before leaving a screen */
        shouldDismissKeyboardBeforeClose?: boolean;

        /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
        shouldEnableMaxHeight?: boolean;

        /** Whether to use the minHeight. Use true for screens where the window height are changing because of Virtual Keyboard */
        shouldEnableMinHeight?: boolean;

        shouldAvoidScrollOnVirtualViewport?: boolean;

        /** Whether to use cached virtual viewport height  */
        shouldUseCachedViewportHeight?: boolean;

        includeSafeAreaPaddingBottom?: boolean;
        includePaddingTop?: boolean;
        enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

        /**
         * Whether the screen is focused. (Only passed if wrapped in ScreenWrapper)
         */
        isFocused?: boolean;

        /** Whether this screen should be hidden from accessibility tree */
        shouldHideFromAccessibility?: boolean;

        ref?: ForwardedRef<ComponentRef<typeof View>>;
    }>;

function ScreenWrapperContainer({
    children,
    style,
    testID,
    bottomContent,
    bottomContentStyle: bottomContentStyleProp,
    keyboardAvoidingViewBehavior = 'padding',
    keyboardVerticalOffset,
    shouldEnableKeyboardAvoidingView = true,
    shouldEnableMaxHeight = false,
    shouldEnableMinHeight = false,
    shouldEnablePickerAvoiding = true,
    shouldDismissKeyboardBeforeClose = true,
    shouldAvoidScrollOnVirtualViewport = true,
    shouldUseCachedViewportHeight = false,
    shouldKeyboardOffsetBottomSafeAreaPadding: shouldKeyboardOffsetBottomSafeAreaPaddingProp,
    enableEdgeToEdgeBottomSafeAreaPadding,
    includePaddingTop = true,
    includeSafeAreaPaddingBottom = false,
    isFocused = true,
    shouldHideFromAccessibility = false,
    ref,
    forwardedFSClass = CONST.FULLSTORY.CLASS.UNMASK,
}: ScreenWrapperContainerProps) {
    const {windowHeight} = useWindowDimensions(shouldUseCachedViewportHeight);
    const heightWithoutKeyboard = useHeightWithoutKeyboard();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // In phone landscape the keyboard leaves room for one input, so the screen keeps its full height behind the
    // keyboard and the browser scrolls the input into view. A footer then can't cover the input.
    const shouldExtendBehindKeyboard = useIsLandscapeKeyboardOpen();
    const shouldLimitToViewport = shouldEnableMaxHeight && !shouldExtendBehindKeyboard;
    const viewportMaxHeight = shouldLimitToViewport ? windowHeight : undefined;
    const maxHeight = shouldExtendBehindKeyboard ? heightWithoutKeyboard : viewportMaxHeight;
    // Android Chrome resizes the page for the keyboard, so the screen clips itself to the viewport to give the browser
    // something to scroll. The navigation card can't do that, because it stops clipping mid-animation. The screen is
    // scrollable so a swipe past the end of a list reaches what's behind the keyboard. WebKit pans the page instead.
    const shouldScrollWithinScreen = shouldExtendBehindKeyboard && !isMobileWebKit();
    // A minimum height would win over the maximum height and stop the clipping
    const minHeight = !shouldScrollWithinScreen && (shouldExtendBehindKeyboard || (shouldEnableMinHeight && !isSafari())) ? heightWithoutKeyboard : undefined;
    const contentMinHeight = shouldScrollWithinScreen ? heightWithoutKeyboard : undefined;
    useRevealFocusedInputOnResize(shouldScrollWithinScreen && isFocused);
    const {isBlurred} = useInputBlurState();
    const {setIsBlurred} = useInputBlurActions();
    const isInputFocused = useTackInputFocus(isFocused && shouldEnableMaxHeight && shouldAvoidScrollOnVirtualViewport && isMobileWebKit());
    // When the screen extends behind the keyboard, Safari has to scroll the page to reveal the input
    const isAvoidingViewportScroll = isInputFocused && shouldLimitToViewport;
    const viewportOffsetTop = useViewportOffsetTop();

    const isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPadding !== undefined;
    const shouldKeyboardOffsetBottomSafeAreaPadding = shouldKeyboardOffsetBottomSafeAreaPaddingProp ?? isUsingEdgeToEdgeMode;
    const {paddingTop, paddingBottom, unmodifiedPaddings} = useSafeAreaPaddings(isUsingEdgeToEdgeMode);

    // since Modals are drawn in separate native view hierarchy we should always add paddings
    const ignoreInsetsConsumption = !useContext(ModalContext).default;

    const paddingTopStyle: StyleProp<ViewStyle> = !includePaddingTop
        ? {}
        : {
              paddingTop: !isUsingEdgeToEdgeMode && ignoreInsetsConsumption ? unmodifiedPaddings.top : paddingTop,
          };

    const showBottomContent = isUsingEdgeToEdgeMode ? !!bottomContent : true;
    const edgeToEdgeBottomContentStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false});
    const shouldUseUnmodifiedPaddings = includeSafeAreaPaddingBottom && ignoreInsetsConsumption;
    const legacyBottomContentStyle: StyleProp<ViewStyle> = shouldUseUnmodifiedPaddings
        ? {
              paddingBottom: unmodifiedPaddings.bottom,
          }
        : {
              // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
              paddingBottom: includeSafeAreaPaddingBottom ? paddingBottom : undefined,
          };

    const bottomContentStyle = [isUsingEdgeToEdgeMode ? edgeToEdgeBottomContentStyle : legacyBottomContentStyle, bottomContentStyleProp];

    const testToolsTapResponder = useTestToolsTapResponder();

    const [keyboardDismissPanResponder] = useState(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponderCapture: (_e, gestureState) => {
                    const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                    const shouldDismissKeyboard = shouldDismissKeyboardBeforeClose && Keyboard.isVisible() && isMobile();

                    return isHorizontalSwipe && shouldDismissKeyboard;
                },
                onPanResponderGrant: Keyboard.dismiss,
            }).panHandlers,
    );

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

    return (
        <View
            ref={ref}
            // This style gives the background for the screens. Stack cards are transparent to make different width screens in RHP possible.
            style={[
                styles.flex1,
                styles.appBG,
                styles.screenWrapperContainerMinHeight(minHeight),
                shouldScrollWithinScreen && [styles.overflowAuto, StyleUtils.getMaximumHeight(windowHeight)],
            ]}
            {...testToolsTapResponder}
            testID={testID}
            fsClass={forwardedFSClass}
            tabIndex={-1}
            accessibilityElementsHidden={shouldHideFromAccessibility}
            aria-hidden={shouldHideFromAccessibility}
        >
            <View
                style={[shouldLimitToViewport && {marginTop: viewportOffsetTop}, style, paddingTopStyle, styles.screenWrapperContainerMinHeight(contentMinHeight)]}
                {...keyboardDismissPanResponder}
            >
                <KeyboardAvoidingView
                    style={[styles.w100, styles.h100, !isBlurred ? {maxHeight} : undefined, isAvoidingViewportScroll ? [styles.overflowAuto, styles.overscrollBehaviorContain] : {}]}
                    behavior={keyboardAvoidingViewBehavior}
                    enabled={shouldEnableKeyboardAvoidingView}
                    // Whether the mobile offline indicator or the content in general
                    // should be offset by the bottom safe area padding when the keyboard is open.
                    shouldOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding}
                    keyboardVerticalOffset={keyboardVerticalOffset}
                >
                    <PickerAvoidingView
                        style={isAvoidingViewportScroll ? [styles.h100, {marginTop: 1}] : styles.flex1}
                        enabled={shouldEnablePickerAvoiding}
                    >
                        <FSClassContext.Provider value={forwardedFSClass}>{children}</FSClassContext.Provider>
                    </PickerAvoidingView>
                </KeyboardAvoidingView>
            </View>
            {showBottomContent && <View style={bottomContentStyle}>{bottomContent}</View>}
        </View>
    );
}

ScreenWrapperContainer.displayName = 'ScreenWrapperContainer';

export default ScreenWrapperContainer;
export type {ScreenWrapperContainerProps};
