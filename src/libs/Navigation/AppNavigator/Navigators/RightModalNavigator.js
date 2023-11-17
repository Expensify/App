import {createStackNavigator} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import RHPScreenOptions from '@libs/Navigation/AppNavigator/RHPScreenOptions';
import useThemeStyles from '@styles/useThemeStyles';
import Overlay from './Overlay';

const Stack = createStackNavigator();

const propTypes = {
    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

function RightModalNavigator(props) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <NoDropZone>
            {!isSmallScreenWidth && <Overlay onPress={props.navigation.goBack} />}
            <View style={styles.RHPNavigatorContainer(isSmallScreenWidth)}>
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
                        name="RoomMembers"
                        component={ModalStackNavigators.RoomMembersModalStackNavigator}
                    />
                    <Stack.Screen
                        name="RoomInvite"
                        component={ModalStackNavigators.RoomInviteModalStackNavigator}
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
                        name="TeachersUnite"
                        component={ModalStackNavigators.NewTeachersUniteNavigator}
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
                    <Stack.Screen
                        name="SignIn"
                        component={ModalStackNavigators.SignInModalStackNavigator}
                    />
                    <Stack.Screen
                        name="Referral"
                        component={ModalStackNavigators.ReferralModalStackNavigator}
                    />
                    <Stack.Screen
                        name="Private_Notes"
                        component={ModalStackNavigators.PrivateNotesModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

RightModalNavigator.propTypes = propTypes;
RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
