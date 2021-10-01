import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TransitionPage from '../../../pages/TransitionPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

const SharedScreens = () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name={SCREENS.TRANSITION}
            options={defaultScreenOptions}
            component={TransitionPage}
        />
    </RootStack.Navigator>
);

SharedScreens.displayName = 'SharedScreens';

export default SharedScreens;
