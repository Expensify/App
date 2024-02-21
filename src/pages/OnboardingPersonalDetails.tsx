import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function OnboardingPersonalDetails() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const theme = useTheme();

    return (
        <View style={[styles.defaultModalContainer, !shouldUseNarrowLayout && styles.pt8]}>
            <HeaderWithBackButton
                shouldShowBackButton={false}
                shouldOverlay
                iconFill={theme.iconColorfulBackground}
                progressBarPercentage={33.3}
            />
        </View>
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPersonalDetails';
export default OnboardingPersonalDetails;
