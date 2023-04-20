import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SCREENS from '../../../../SCREENS';
import NotFoundPage from '../../../../pages/ErrorPage/NotFoundPage';

const Stack = createStackNavigator();

function FullScreenNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name={SCREENS.NOT_FOUND}
                options={{headerShown: false}}
                component={NotFoundPage}
            />
        </Stack.Navigator>
    );
}

export default FullScreenNavigator;
