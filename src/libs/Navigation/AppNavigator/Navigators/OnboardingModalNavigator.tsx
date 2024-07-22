import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useDisableModalDismissOnEscape from '@hooks/useDisableModalDismissOnEscape';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import hasCompletedGuidedSetupFlowSelector from '@libs/hasCompletedGuidedSetupFlowSelector';
import OnboardingModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/OnboardingModalNavigatorScreenOptions';
import Navigation from '@libs/Navigation/Navigation';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import OnboardingWork from '@pages/OnboardingWork';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });

    useDisableModalDismissOnEscape();

    useEffect(() => {
        if (!hasCompletedGuidedSetupFlow) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            // Need to go back to previous route and then redirect to Concierge,
            // otherwise going back on Concierge will go to onboarding and then redirected to Concierge again
            Navigation.goBack();
            Report.navigateToConciergeChat();
        });
    }, [hasCompletedGuidedSetupFlow]);

    const outerViewRef = React.useRef<View>(null);

    const handleOuterClick = useCallback(() => {
        OnboardingRefManager.handleOuterClick();
    }, []);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleOuterClick, {shouldBubble: true});

    if (hasCompletedGuidedSetupFlow) {
        return null;
    }
    return (
        <NoDropZone>
            <Overlay />
            <View
                ref={outerViewRef}
                onClick={handleOuterClick}
                style={styles.onboardingNavigatorOuterView}
            >
                <FocusTrapForScreens>
                    <View
                        onClick={(e) => e.stopPropagation()}
                        style={styles.OnboardingNavigatorInnerView(shouldUseNarrowLayout)}
                    >
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
                </FocusTrapForScreens>
            </View>
        </NoDropZone>
    );
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default OnboardingModalNavigator;
