import React, {forwardRef} from 'react';
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

    // Should enable picker avoiding
    shouldEnablePickerAvoiding?: boolean;

    // Offline indicator style
    offlineIndicatorStyle?: StyleProp<ViewStyle>;
};

function InteractiveStepWrapper(
    {
        children,
        wrapperID,
        handleBackButtonPress,
        headerTitle,
        headerSubtitle,
        startStepIndex,
        stepNames,
        shouldEnableMaxHeight,
        shouldShowOfflineIndicator,
        shouldEnablePickerAvoiding = false,
        offlineIndicatorStyle,
    }: InteractiveStepWrapperProps,
    ref: React.ForwardedRef<View>,
) {
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            ref={ref}
            testID={wrapperID}
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={shouldEnablePickerAvoiding}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
            shouldShowOfflineIndicator={shouldShowOfflineIndicator}
            offlineIndicatorStyle={offlineIndicatorStyle}
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

export default forwardRef(InteractiveStepWrapper);
