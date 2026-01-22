import type {ForwardedRef, ReactNode} from 'react';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Keyboard, PanResponder, View} from 'react-native';
import {PickerAvoidingView} from 'react-native-picker-select';
import {useInputBlurContext} from '@components/InputBlurContext';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import ModalContext from '@components/Modal/ModalContext';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useInitialDimensions from '@hooks/useInitialWindowDimensions';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useTackInputFocus from '@hooks/useTackInputFocus';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobile, isMobileWebKit, isSafari} from '@libs/Browser';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import addViewportResizeListener from '@libs/VisualViewport';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';

type ScreenWrapperContainerProps = ForwardedFSClassProps &
    React.PropsWithChildren<{
        /** A unique ID to find the screen wrapper in tests */
        testID: string;

        /** Additional styles to add */
        style?: StyleProp<ViewStyle>;

        /** Content to display under the offline indicator */
        bottomContent?: ReactNode;

        /** Additional styles for bottom content */
        bottomContentStyle?: StyleProp<ViewStyle>;

        /** Whether the screen wrapper has finished the transition */
        didScreenTransitionEnd?: boolean;

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

        /** Whether to avoid scroll on virtual viewport */
        shouldAvoidScrollOnVirtualViewport?: boolean;

        /** Whether to use cached virtual viewport height  */
        shouldUseCachedViewportHeight?: boolean;

        /** Whether to include padding bottom */
        includeSafeAreaPaddingBottom?: boolean;

        /** Whether to include padding top */
        includePaddingTop?: boolean;

        /** Whether to enable edge to edge bottom safe area padding */
        enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

        /**
         * Whether the screen is focused. (Only passed if wrapped in ScreenWrapper)
         */
        isFocused?: boolean;

        /** Reference to the outer element */
        ref?: ForwardedRef<View>;
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
    ref,
    forwardedFSClass,
}: ScreenWrapperContainerProps) {
    const {windowHeight} = useWindowDimensions(shouldUseCachedViewportHeight);
    const {initialHeight} = useInitialDimensions();
    const styles = useThemeStyles();
    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
    const minHeight = shouldEnableMinHeight && !isSafari() ? initialHeight : undefined;
    const {isBlurred, setIsBlurred} = useInputBlurContext();
    const isAvoidingViewportScroll = useTackInputFocus(isFocused && shouldEnableMaxHeight && shouldAvoidScrollOnVirtualViewport && isMobileWebKit());

    const isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPadding !== undefined;
    const shouldKeyboardOffsetBottomSafeAreaPadding = shouldKeyboardOffsetBottomSafeAreaPaddingProp ?? isUsingEdgeToEdgeMode;
    const {paddingTop, paddingBottom, unmodifiedPaddings} = useSafeAreaPaddings(isUsingEdgeToEdgeMode);

    // since Modals are drawn in separate native view hierarchy we should always add paddings
    const ignoreInsetsConsumption = !useContext(ModalContext).default;

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
        () => [isUsingEdgeToEdgeMode ? edgeToEdgeBottomContentStyle : legacyBottomContentStyle, bottomContentStyleProp],
        [isUsingEdgeToEdgeMode, edgeToEdgeBottomContentStyle, legacyBottomContentStyle, bottomContentStyleProp],
    );

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

    return (
        <View
            ref={ref}
            // This style gives the background for the screens. Stack cards are transparent to make different width screens in RHP possible.
            style={[styles.flex1, styles.appBG, styles.screenWrapperContainerMinHeight(minHeight)]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...panResponder.panHandlers}
            testID={testID}
            fsClass={forwardedFSClass}
        >
            <View
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                style={[style, paddingTopStyle]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...keyboardDismissPanResponder.panHandlers}
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
                        {children}
                    </PickerAvoidingView>
                </KeyboardAvoidingView>
            </View>
            {showBottomContent && <View style={bottomContentStyle}>{bottomContent}</View>}
        </View>
    );
}

ScreenWrapperContainer.displayName = 'ScreenWrapperContainer';

export default React.memo(ScreenWrapperContainer);
export type {ScreenWrapperContainerProps};
