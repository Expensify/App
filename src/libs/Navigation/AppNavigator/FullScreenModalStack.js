import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SCREENS from '../../../SCREENS';
import NotFoundPage from '../../../pages/ErrorPage/NotFoundPage';

const RootStack = createStackNavigator();

function FullScreenModalStack() {
    return (
        <RootStack.Navigator>
            <RootStack.Screen
                name={SCREENS.NOT_FOUND}
                options={{headerShown: false}}
                component={NotFoundPage}

                // TODO-NR do we want to handle this with listeners?
                // we may need to modyfi this part to work with chat / modals / chat / modals on the stack. Previously there could be only one chat
                // listeners={modalScreenListeners}
            />
        </RootStack.Navigator>
    );
}

export default FullScreenModalStack;
