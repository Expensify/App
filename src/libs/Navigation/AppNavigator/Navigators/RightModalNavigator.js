import React from 'react';
import {View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import * as ModalStackNavigators from '../ModalStackNavigators';
import RHPScreenOptions from '../RHPScreenOptions';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import variables from '../../../../styles/variables';
import {withNavigationPropTypes} from '../../../../components/withNavigation';
import styles from '../../../../styles/styles';
import Overlay from './Overlay';

const Stack = createStackNavigator();

const propTypes = {
    ...withNavigationPropTypes,
};

function RightModalNavigator(props) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <>
            {!isSmallScreenWidth && <Overlay onPress={props.navigation.goBack} />}
            <View
                style={[
                    styles.rhpNavigatorContainer,
                    {
                        width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
                    },
                ]}
            >
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
                        options={{
                            // Disable animation for this screen because it causes an animation glitch when using shortcuts
                            animationEnabled: false,
                        }}
                    />
                    <Stack.Screen
                        name="Search"
                        component={ModalStackNavigators.SearchModalStackNavigator}
                        options={{
                            // Disable animation for this screen because it causes an animation glitch when using shortcuts
                            animationEnabled: false,
                        }}
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
                        name="Flag_Comment"
                        component={ModalStackNavigators.FlagCommentStackNavigator}
                    />
                    <Stack.Screen
                        name="EditRequest"
                        component={ModalStackNavigators.EditRequestStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </>
    );
}

RightModalNavigator.propTypes = propTypes;
RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
