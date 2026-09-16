import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import CollapsibleHeaderOnKeyboard from './CollapsibleHeaderOnKeyboard';
import HeaderWithBackButton from './HeaderWithBackButton';
import InteractiveStepSubHeader from './InteractiveStepSubHeader';
import ScreenWrapper from './ScreenWrapper';

type InteractiveStepWrapperProps = {
    children: React.ReactNode;
    wrapperID: string;
    handleBackButtonPress: () => void;
    headerTitle: string;
    headerSubtitle?: string;

    /** Index of the highlighted step */
    startStepIndex?: number;

    stepNames?: readonly string[];
    shouldEnableMaxHeight?: boolean;
    shouldShowOfflineIndicator?: boolean;
    shouldShowOfflineIndicatorInWideScreen?: boolean;
    shouldEnablePickerAvoiding?: boolean;
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

    onEntryTransitionEnd?: () => void;
    ref?: ForwardedRef<View>;
};

const INPUT_HEADER_HEIGHT = variables.lineHeightXXLarge;

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
            <CollapsibleHeaderOnKeyboard collapsibleHeaderOffset={INPUT_HEADER_HEIGHT}>
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
                            currentStepAccessibilityDescription={headerTitle}
                        />
                    </View>
                )}
            </CollapsibleHeaderOnKeyboard>

            {children}
        </ScreenWrapper>
    );
}

export default InteractiveStepWrapper;
