import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import OnboardingModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/OnboardingModalNavigatorScreenOptions';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import OnboardingWork from '@pages/OnboardingWork';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    const outerViewRef = React.useRef<View>(null);

    const handleOuterClick = useCallback(() => {
        OnboardingRefManager.handleOuterClick();
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key !== CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
            return;
        }
        OnboardingRefManager.handleOuterClick();
    }, []);

    useEffect(() => {
        window?.addEventListener?.('keydown', handleKeyDown);
        return () => {
            window?.removeEventListener?.('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <NoDropZone>
            <Overlay />
            <View
                ref={outerViewRef}
                onClick={handleOuterClick}
                style={styles.onboardingNavigatorOuterView}
            >
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
            </View>
        </NoDropZone>
    );
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default OnboardingModalNavigator;
