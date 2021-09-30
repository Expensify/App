import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LogInWithShortLivedTokenPage from '../../../pages/TransitionPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

export default () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name={SCREENS.TRANSITION}
            options={defaultScreenOptions}
            component={LogInWithShortLivedTokenPage}
        />
    </RootStack.Navigator>
);
