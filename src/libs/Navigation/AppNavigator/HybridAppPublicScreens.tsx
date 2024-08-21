import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import type {HybridAppPublicScreensParamList} from '@navigation/types';
import GenericErrorPage from '@pages/ErrorPage/GenericErrorPage';
import HybridAppLoading from '@pages/HybridApp/HybridAppLoading';
import HybridAppTransitionPage from '@pages/HybridApp/HybridAppTransitionPage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator<HybridAppPublicScreensParamList>();

function HybridAppPublicScreens() {
    return (
        <RootStack.Navigator>
            {/* The structure for the HOME route has to be the same in public and auth screens. That's why the name for SignInPage is BOTTOM_TAB_NAVIGATOR. */}
            <RootStack.Screen
                name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
                options={defaultScreenOptions}
                component={HybridAppLoading}
            />
            <RootStack.Screen
                name={SCREENS.TRANSITION_BETWEEN_APPS}
                options={defaultScreenOptions}
                component={HybridAppTransitionPage}
            />
            <RootStack.Screen
                name={SCREENS.HYBRID_APP_ERROR}
                options={defaultScreenOptions}
                component={GenericErrorPage}
            />
        </RootStack.Navigator>
    );
}

HybridAppPublicScreens.displayName = 'HybridAppPublicScreens';

export default HybridAppPublicScreens;
