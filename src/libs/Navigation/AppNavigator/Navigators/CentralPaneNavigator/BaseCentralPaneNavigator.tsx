import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import type {AuthScreensParamList} from '@navigation/types';
import SearchPage from '@pages/Search/SearchPage';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<AuthScreensParamList>();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;


function BaseCentralPaneNavigator() {
    const styles = useThemeStyles();
    const options = {
        headerShown: false,
        title: 'New Expensify',

        // Prevent unnecessary scrolling
        cardStyle: styles.cardStyleNavigator,
    };
    return (
        <Stack.Navigator screenOptions={options}>
          
        </Stack.Navigator>
    );
}

export default BaseCentralPaneNavigator;
