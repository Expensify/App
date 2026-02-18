import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import FocusTrapForScreens from './FocusTrap/FocusTrapForScreen';

type OnboardingWrapperProps = {
    /** Rendered child component */
    children: React.ReactNode;
};

function OnboardingWrapper({children}: OnboardingWrapperProps) {
    const styles = useThemeStyles();

    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>{children}</View>
        </FocusTrapForScreens>
    );
}

export default OnboardingWrapper;
