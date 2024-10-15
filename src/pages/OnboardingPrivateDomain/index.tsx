import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OnboardingPrivateDomainProps} from './types';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';

function OnboardingPrivateDomain({...rest}: OnboardingPrivateDomainProps) {
    const styles = useThemeStyles();

    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>
                <BaseOnboardingPrivateDomain
                    shouldUseNativeStyles={false}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                />
            </View>
        </FocusTrapForScreens>
    );
}

OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';

export default OnboardingPrivateDomain;
