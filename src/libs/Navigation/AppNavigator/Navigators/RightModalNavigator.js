import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import * as ModalStackNavigators from '../ModalStackNavigators';
import RHPScreenOptions from '../RHPScreenOptions';

const Stack = createStackNavigator();

function RigthModalNavigator() {
    return (
        <Stack.Navigator screenOptions={RHPScreenOptions}>
            <Stack.Screen
                name="Settings"
                component={ModalStackNavigators.SettingsModalStackNavigator}
            />
            <Stack.Screen
                name="NewChat"
                component={ModalStackNavigators.NewChatModalStackNavigator}
            />
            <Stack.Screen
                name="NewGroup"
                component={ModalStackNavigators.NewGroupModalStackNavigator}
            />
            <Stack.Screen
                name="Search"
                component={ModalStackNavigators.SearchModalStackNavigator}
            />
            <Stack.Screen
                name="Details"
                component={ModalStackNavigators.DetailsModalStackNavigator}
            />
            <Stack.Screen
                name="Profile"
                component={ModalStackNavigators.ProfileModalStackNavigator}
            />
            <Stack.Screen
                name="Report_Details"
                component={ModalStackNavigators.ReportDetailsModalStackNavigator}
            />
            <Stack.Screen
                name="Report_Settings"
                component={ModalStackNavigators.ReportSettingsModalStackNavigator}
            />
            <Stack.Screen
                name="Report_WelcomeMessage"
                component={ModalStackNavigators.ReportWelcomeMessageModalStackNavigator}
            />
            <Stack.Screen
                name="Participants"
                component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
            />
            <Stack.Screen
                name="MoneyRequest"
                component={ModalStackNavigators.MoneyRequestModalStackNavigator}
            />
            <Stack.Screen
                name="NewTask"
                component={ModalStackNavigators.NewTaskModalStackNavigator}
            />
            <Stack.Screen
                name="Task_Details"
                component={ModalStackNavigators.TaskModalStackNavigator}
            />
            <Stack.Screen
                name="EnablePayments"
                component={ModalStackNavigators.EnablePaymentsStackNavigator}
            />
            <Stack.Screen
                name="SplitDetails"
                component={ModalStackNavigators.SplitDetailsModalStackNavigator}
            />
            <Stack.Screen
                name="AddPersonalBankAccount"
                component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
            />
            <Stack.Screen
                name="Wallet_Statement"
                component={ModalStackNavigators.WalletStatementStackNavigator}
            />
            <Stack.Screen
                name="Select_Year"
                component={ModalStackNavigators.YearPickerStackNavigator}
            />
            <Stack.Screen
                name="Flag_Comment"
                component={ModalStackNavigators.FlagCommentStackNavigator}
            />
            <Stack.Screen
                name="EditRequest"
                component={ModalStackNavigators.EditRequestStackNavigator}
            />
        </Stack.Navigator>
    );
}

export default RigthModalNavigator;
