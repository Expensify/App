import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';
import InboxListScreen from './InboxListScreen';
import InboxReportScreen from './InboxReportScreen';

type InboxStackParamList = {
    InboxList: undefined;
    InboxReport: {reportID: string};
};

const Stack = createStackNavigator<InboxStackParamList>();

function InboxSidePanel() {
    const styles = useThemeStyles();
    return (
        <IsInSidePanelContext.Provider value>
            <View style={[styles.flex1, styles.h100, styles.appBG]}>
                <SidebarOrderedReportsContextProvider>
                    <NavigationContainer independent>
                        <Stack.Navigator screenOptions={{headerShown: false}}>
                            <Stack.Screen
                                name="InboxList"
                                component={InboxListScreen}
                            />
                            <Stack.Screen
                                name="InboxReport"
                                component={InboxReportScreen}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </SidebarOrderedReportsContextProvider>
            </View>
        </IsInSidePanelContext.Provider>
    );
}

export default InboxSidePanel;
