import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import OnboardingModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/OnboardingModalNavigatorScreenOptions';
import Navigation from '@libs/Navigation/Navigation';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import OnboardingWork from '@pages/OnboardingWork';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type OnboardingModalNavigatorProps = {
    /** Current onboarding completion status */
    hasCompletedGuidedSetupFlow: boolean;
};

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator({hasCompletedGuidedSetupFlow}: OnboardingModalNavigatorProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    if (hasCompletedGuidedSetupFlow) {
        Navigation.goBack();
        Report.navigateToConciergeChat();
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <NoDropZone>
            <Overlay />
            <View style={styles.onboardingNavigatorOuterView}>
                <View style={styles.OnboardingNavigatorInnerView(shouldUseNarrowLayout)}>
                    <Stack.Navigator screenOptions={OnboardingModalNavigatorScreenOptions()}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PURPOSE}
                            component={OnboardingPurpose}
                        />
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                            component={OnboardingPersonalDetails}
                        />
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.WORK}
                            component={OnboardingWork}
                        />
                    </Stack.Navigator>
                </View>
            </View>
        </NoDropZone>
    );
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default withOnyx<OnboardingModalNavigatorProps, OnboardingModalNavigatorProps>({
    hasCompletedGuidedSetupFlow: {
        key: ONYXKEYS.NVP_ONBOARDING,
        selector: (onboarding) => onboarding?.hasCompletedGuidedSetupFlow ?? true,
    },
})(OnboardingModalNavigator);
