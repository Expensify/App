import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseOnboardingAccounting from './BaseOnboardingAccounting';
import type {OnboardingAccountingProps} from './types';

function OnboardingAccounting(props: OnboardingAccountingProps) {
    const styles = useThemeStyles();
    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>
                <BaseOnboardingAccounting
                    shouldUseNativeStyles={false}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </View>
        </FocusTrapForScreens>
    );
}

OnboardingAccounting.displayName = 'OnboardingAccounting';

export default OnboardingAccounting;
