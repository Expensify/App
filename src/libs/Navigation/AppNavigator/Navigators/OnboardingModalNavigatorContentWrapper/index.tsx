import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';

type OnboardingModalNavigatorContentWrapperProps = {
    /** Rendered child component */
    children: React.ReactNode;

    /** Whether the onboarding is on a medium or larger screen width */
    onboardingIsMediumOrLargerScreenWidth: boolean;
};

function OnboardingModalNavigatorContentWrapper({children, onboardingIsMediumOrLargerScreenWidth}: OnboardingModalNavigatorContentWrapperProps) {
    const styles = useThemeStyles();

    return (
        <View
            onClick={(e) => e.stopPropagation()}
            style={[styles.maxHeight100Percentage, styles.overflowHidden, styles.OnboardingNavigatorInnerView(onboardingIsMediumOrLargerScreenWidth)]}
        >
            {children}
        </View>
    );
}

export default OnboardingModalNavigatorContentWrapper;
