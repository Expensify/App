import React, { useMemo } from 'react';
import {View} from 'react-native';
import NoDropZone from "@components/DragAndDrop/NoDropZone";
import type { OnboardingModalNavigatorParamList } from "@libs/Navigation/types";
import { createStackNavigator  } from "@react-navigation/stack";
import SCREENS from "@src/SCREENS";
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import useThemeStyles from '@hooks/useThemeStyles';
// import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import PurposeForUsingExpensifyModal from '@components/PurposeForUsingExpensifyModal';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Overlay from './Overlay';

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {

    const styles = useThemeStyles();
    const screenOptions = useMemo(() => ModalNavigatorScreenOptions(styles), [styles]);
    const {isSmallScreenWidth} = useWindowDimensions();

    return <NoDropZone>
        <View>
            {!isSmallScreenWidth && <Overlay onPress={() => {}}/>}
            <Stack.Navigator screenOptions={{...screenOptions, cardStyle: {backgroundColor: 'transparent'}}}>
                {/* <Stack.Screen
                    name={SCREENS.ONBOARDING_MODAL.ONBOARDING}
                    component={ModalStackNavigators.OnboardingModalStackNavigator} 
                /> */}
                <Stack.Screen
                    name={SCREENS.ONBOARDING.WELCOME}
                    component={PurposeForUsingExpensifyModal} 
                />
                <Stack.Screen
                    name={SCREENS.ONBOARDING.PURPOSE}
                    component={PurposeForUsingExpensifyModal} 
                />
            </Stack.Navigator>
        </View>
    </NoDropZone>
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default OnboardingModalNavigator;