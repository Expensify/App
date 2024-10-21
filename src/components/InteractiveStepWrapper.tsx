import React from 'react';
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

    // Index of the highlighted step
    startStepIndex?: number;

    // Array of step names
    stepNames?: readonly string[];
};

function InteractiveStepWrapper({children, wrapperID, handleBackButtonPress, headerTitle, startStepIndex, stepNames}: InteractiveStepWrapperProps) {
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            testID={wrapperID}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            {stepNames && (
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
