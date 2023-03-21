import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import * as ModalStackNavigators from './ModalStackNavigators';
import defaultModalScreenOptions from './defaultModalScreenOptions';

const RootStack = createStackNavigator();

function RigthModalStack() {
    return (
        <RootStack.Navigator>
            <RootStack.Screen
                name="Settings"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.SettingsModalStackNavigator}
            />
            <RootStack.Screen
                name="NewChat"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.NewChatModalStackNavigator}
            />
            <RootStack.Screen
                name="NewGroup"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.NewGroupModalStackNavigator}
            />
            <RootStack.Screen
                name="Search"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.SearchModalStackNavigator}
            />
            <RootStack.Screen
                name="Details"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.DetailsModalStackNavigator}
            />
            <RootStack.Screen
                name="Report_Details"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportDetailsModalStackNavigator}
            />
            <RootStack.Screen
                name="Report_Settings"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportSettingsModalStackNavigator}
            />
            <RootStack.Screen
                name="Participants"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
            />
            <RootStack.Screen
                name="IOU_Request"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.IOURequestModalStackNavigator}
            />
            <RootStack.Screen
                name="IOU_Bill"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.IOUBillStackNavigator}
            />
            <RootStack.Screen
                name="EnablePayments"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.EnablePaymentsStackNavigator}
            />
            <RootStack.Screen
                name="IOU_Details"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.IOUDetailsModalStackNavigator}
            />
            <RootStack.Screen
                name="AddPersonalBankAccount"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
            />
            <RootStack.Screen
                name="IOU_Send"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.IOUSendModalStackNavigator}
            />
            <RootStack.Screen
                name="Wallet_Statement"
                options={defaultModalScreenOptions}
                component={ModalStackNavigators.WalletStatementStackNavigator}
            />
        </RootStack.Navigator>
    );
}

export default RigthModalStack;
