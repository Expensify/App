import type {ForwardedRef} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import HeaderWithBackButton from './HeaderWithBackButton';
import InteractiveStepSubHeader from './InteractiveStepSubHeader';
import ScreenWrapper from './ScreenWrapper';

type InteractiveStepWrapperProps = {
    // Step content
    children: React.ReactNode;

    // ID of the wrapper
    wrapperID: string;

    // Function to handle back button press
    handleBackButtonPress: () => void;

    // Title of the back button header
    headerTitle: string;

    // Subtitle of the back button header
    headerSubtitle?: string;

    // Index of the highlighted step
    startStepIndex?: number;

    // Array of step names
    stepNames?: readonly string[];

    // Should enable max height
    shouldEnableMaxHeight?: boolean;

    // Should show offline indicator
    shouldShowOfflineIndicator?: boolean;

    // Should show offline indicator in wide screen
    shouldShowOfflineIndicatorInWideScreen?: boolean;

    // Should enable picker avoiding
    shouldEnablePickerAvoiding?: boolean;

    // Offline indicator style
    offlineIndicatorStyle?: StyleProp<ViewStyle>;

    /**
     * Whether the KeyboardAvoidingView should compensate for the bottom safe area padding.
     * The KeyboardAvoidingView will use a negative keyboardVerticalOffset.
     */
    shouldKeyboardOffsetBottomSafeAreaPadding?: boolean;

    /**
     * Temporary flag to disable safe area bottom spacing in the ScreenWrapper and to allow edge-to-edge content
     * The ScreenWrapper should not always apply bottom safe area padding, instead it should be applied to the scrollable/bottom-docked content directly.
     * This flag can be removed, once all components/screens have switched to edge-to-edge safe area handling.
     */
    enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

    /**
     * Callback to be called when the screen entry transition ends.
     */
    onEntryTransitionEnd?: () => void;

    // Reference to the outer element
    ref?: ForwardedRef<View>;
};

function InteractiveStepWrapper({
    children,
    wrapperID,
    handleBackButtonPress,
    headerTitle,
    headerSubtitle,
    startStepIndex,
    stepNames,
    shouldEnableMaxHeight,
    shouldShowOfflineIndicator,
    shouldShowOfflineIndicatorInWideScreen,
    shouldEnablePickerAvoiding = false,
    offlineIndicatorStyle,
    shouldKeyboardOffsetBottomSafeAreaPadding,
    enableEdgeToEdgeBottomSafeAreaPadding,
    onEntryTransitionEnd,
    ref,
}: InteractiveStepWrapperProps) {
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            ref={ref}
            testID={wrapperID}
            includeSafeAreaPaddingBottom
            enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPadding}
            shouldEnablePickerAvoiding={shouldEnablePickerAvoiding}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
            shouldShowOfflineIndicator={shouldShowOfflineIndicator}
            shouldShowOfflineIndicatorInWideScreen={shouldShowOfflineIndicatorInWideScreen}
            offlineIndicatorStyle={offlineIndicatorStyle}
            shouldKeyboardOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding}
            onEntryTransitionEnd={onEntryTransitionEnd}
        >
            <HeaderWithBackButton
                title={headerTitle}
                subtitle={headerSubtitle}
                onBackButtonPress={handleBackButtonPress}
            />
            {!!stepNames && (
                <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                    <InteractiveStepSubHeader
                        startStepIndex={startStepIndex}
                        stepNames={stepNames}
                    />
                </View>
            )}
            {children}
        </ScreenWrapper>
    );
}

InteractiveStepWrapper.displayName = 'InteractiveStepWrapper';

export default InteractiveStepWrapper;
