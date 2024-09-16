import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';
import type {OnboardingPersonalDetailsProps} from './types';

function OnboardingPersonalDetails({...rest}: OnboardingPersonalDetailsProps) {
    const styles = useThemeStyles();

    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>
                <BaseOnboardingPersonalDetails
                    shouldUseNativeStyles={false}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                />
            </View>
        </FocusTrapForScreens>
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPurpose';

export default OnboardingPersonalDetails;
