import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type OnboardingModalNavigatorContentWrapperProps = {
    children: React.ReactNode;
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
