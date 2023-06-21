import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import * as ModalStackNavigators from '../ModalStackNavigators';
import defaultModalScreenOptions from '../defaultModalScreenOptions';

const Stack = createStackNavigator();

function RigthModalNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Settings"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.SettingsModalStackNavigator}
            />
            <Stack.Screen
                name="NewChat"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.NewChatModalStackNavigator}
            />
            <Stack.Screen
                name="NewGroup"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.NewGroupModalStackNavigator}
            />
            <Stack.Screen
                name="Search"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.SearchModalStackNavigator}
            />
            <Stack.Screen
                name="Details"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.DetailsModalStackNavigator}
            />
            <Stack.Screen
                name="Profile"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ProfileModalStackNavigator}
            />
            <Stack.Screen
                name="Report_Details"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportDetailsModalStackNavigator}
            />
            <Stack.Screen
                name="Report_Settings"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportSettingsModalStackNavigator}
            />
            <Stack.Screen
                name="Report_WelcomeMessage"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportWelcomeMessageModalStackNavigator}
            />
            <Stack.Screen
                name="Participants"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
            />
            <Stack.Screen
                name="MoneyRequest"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.MoneyRequestModalStackNavigator}
            />
            <Stack.Screen
                name="NewTask"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.NewTaskModalStackNavigator}
            />
            <Stack.Screen
                name="Task_Details"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.TaskModalStackNavigator}
            />
            <Stack.Screen
                name="EnablePayments"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.EnablePaymentsStackNavigator}
            />
            <Stack.Screen
                name="SplitDetails"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.SplitDetailsModalStackNavigator}
            />
            <Stack.Screen
                name="AddPersonalBankAccount"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
            />
            <Stack.Screen
                name="Wallet_Statement"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.WalletStatementStackNavigator}
            />
            <Stack.Screen
                name="Select_Year"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.YearPickerStackNavigator}
            />
            <Stack.Screen
                name="Flag_Comment"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.FlagCommentStackNavigator}
            />
        </Stack.Navigator>
    );
}

export default RigthModalNavigator;
