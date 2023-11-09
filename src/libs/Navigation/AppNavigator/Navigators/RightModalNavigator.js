import {createStackNavigator} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import RHPScreenOptions from '@libs/Navigation/AppNavigator/RHPScreenOptions';
import styles from '@styles/styles';
import Overlay from './Overlay';

const Stack = createStackNavigator();

const propTypes = {
    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

function RightModalNavigator(props) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <NoDropZone>
            {!shouldUseNarrowLayout && <Overlay onPress={props.navigation.goBack} />}
            <View style={styles.RHPNavigatorContainer(shouldUseNarrowLayout)}>
                <Stack.Navigator screenOptions={RHPScreenOptions}>
                    <Stack.Screen
                        name="Settings"
                        component={ModalStackNavigators.SettingsModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="NewChat"
                        component={ModalStackNavigators.NewChatModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Search"
                        component={ModalStackNavigators.SearchModalStackNavigator}
                        options={{
                            // Disable animation for this screen because it causes an animation glitch when using shortcuts
                            animationEnabled: false,
                        }}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Details"
                        component={ModalStackNavigators.DetailsModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ModalStackNavigators.ProfileModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Report_Details"
                        component={ModalStackNavigators.ReportDetailsModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Report_Settings"
                        component={ModalStackNavigators.ReportSettingsModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Report_WelcomeMessage"
                        component={ModalStackNavigators.ReportWelcomeMessageModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Participants"
                        component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="RoomMembers"
                        component={ModalStackNavigators.RoomMembersModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="RoomInvite"
                        component={ModalStackNavigators.RoomInviteModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="MoneyRequest"
                        component={ModalStackNavigators.MoneyRequestModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="NewTask"
                        component={ModalStackNavigators.NewTaskModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="TeachersUnite"
                        component={ModalStackNavigators.NewTeachersUniteNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Task_Details"
                        component={ModalStackNavigators.TaskModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="EnablePayments"
                        component={ModalStackNavigators.EnablePaymentsStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="SplitDetails"
                        component={ModalStackNavigators.SplitDetailsModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="AddPersonalBankAccount"
                        component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Wallet_Statement"
                        component={ModalStackNavigators.WalletStatementStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Flag_Comment"
                        component={ModalStackNavigators.FlagCommentStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="EditRequest"
                        component={ModalStackNavigators.EditRequestStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="SignIn"
                        component={ModalStackNavigators.SignInModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                    <Stack.Screen
                        name="Private_Notes"
                        component={ModalStackNavigators.PrivateNotesModalStackNavigator}
                        initialParams={{isInRHP: true}}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

RightModalNavigator.propTypes = propTypes;
RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
