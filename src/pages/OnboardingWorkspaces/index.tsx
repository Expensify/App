import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OnboardingWorkspacesProps} from './types';
import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    const styles = useThemeStyles();

    return (
        <FocusTrapForScreens>
            <View style={styles.h100}>
                <BaseOnboardingWorkspaces
                    shouldUseNativeStyles={false}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                />
            </View>
        </FocusTrapForScreens>
    );
}

OnboardingWorkspaces.displayName = 'OnboardingWorkspaces';

export default OnboardingWorkspaces;
