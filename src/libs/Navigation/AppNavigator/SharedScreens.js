import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LogInWithShortLivedTokenPage from '../../../pages/LogInWithShortLivedTokenPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

export default () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name={SCREENS.LOG_IN_WITH_SHORT_LIVED_TOKEN}
            options={defaultScreenOptions}
            component={LogInWithShortLivedTokenPage}
        />
    </RootStack.Navigator>
);
