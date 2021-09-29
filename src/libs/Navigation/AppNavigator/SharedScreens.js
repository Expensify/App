import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import TransitionPage from '../../../pages/TransitionPage';

const Stack = createStackNavigator();

export default () => (
    <Stack.Navigator>
        <Stack.Screen
            name={SCREENS.TRANSITION}
            options={defaultScreenOptions}
            component={TransitionPage}
        />
    </Stack.Navigator>
);
