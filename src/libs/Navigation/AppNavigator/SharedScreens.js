import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TransitionPage from '../../../pages/Transition/TransitionPage';
import TransitionNewWorkspace from '../../../pages/Transition/TransitionNewWorkspace';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

export default () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name={SCREENS.TRANSITION}
            options={defaultScreenOptions}
            component={TransitionPage}
        />
        <RootStack.Screen
            name="NewWorkspace"
            options={defaultScreenOptions}
            component={TransitionNewWorkspace}
        />
    </RootStack.Navigator>
);
