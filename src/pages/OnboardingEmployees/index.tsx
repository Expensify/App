import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseOnboardingEmployees from './BaseOnboardingEmployees';
import type {OnboardingEmployeesProps} from './types';

function OnboardingEmployees({...rest}: OnboardingEmployeesProps) {
    const styles = useThemeStyles();
    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>
                <BaseOnboardingEmployees
                    shouldUseNativeStyles={false}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                />
            </View>
        </FocusTrapForScreens>
    );
}

OnboardingEmployees.displayName = 'OnboardingEmployees';

export default OnboardingEmployees;
