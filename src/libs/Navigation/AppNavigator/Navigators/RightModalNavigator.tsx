import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import RHPScreenOptions from '@libs/Navigation/AppNavigator/RHPScreenOptions';
import type {AuthScreensParamList, RightModalNavigatorParamList} from '@navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type RightModalNavigatorProps = StackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

const Stack = createStackNavigator<RightModalNavigatorParamList>();

function RightModalNavigator({navigation}: RightModalNavigatorProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = useMemo(() => RHPScreenOptions(styles), [styles]);

    return (
        <NoDropZone>
            {!isSmallScreenWidth && <Overlay onPress={navigation.goBack} />}
            <View style={styles.RHPNavigatorContainer(isSmallScreenWidth)}>
                <Stack.Navigator screenOptions={screenOptions}>
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SETTINGS}
                        component={ModalStackNavigators.SettingsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.NEW_CHAT}
                        component={ModalStackNavigators.NewChatModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SEARCH}
                        component={ModalStackNavigators.SearchModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.DETAILS}
                        component={ModalStackNavigators.DetailsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.PROFILE}
                        component={ModalStackNavigators.ProfileModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.REPORT_DETAILS}
                        component={ModalStackNavigators.ReportDetailsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.REPORT_SETTINGS}
                        component={ModalStackNavigators.ReportSettingsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.REPORT_WELCOME_MESSAGE}
                        component={ModalStackNavigators.ReportWelcomeMessageModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.PARTICIPANTS}
                        component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.ROOM_MEMBERS}
                        component={ModalStackNavigators.RoomMembersModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.ROOM_INVITE}
                        component={ModalStackNavigators.RoomInviteModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.MONEY_REQUEST}
                        component={ModalStackNavigators.MoneyRequestModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.NEW_TASK}
                        component={ModalStackNavigators.NewTaskModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.TEACHERS_UNITE}
                        component={ModalStackNavigators.NewTeachersUniteNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.TASK_DETAILS}
                        component={ModalStackNavigators.TaskModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS}
                        component={ModalStackNavigators.EnablePaymentsStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SPLIT_DETAILS}
                        component={ModalStackNavigators.SplitDetailsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT}
                        component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.WALLET_STATEMENT}
                        component={ModalStackNavigators.WalletStatementStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.FLAG_COMMENT}
                        component={ModalStackNavigators.FlagCommentStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.EDIT_REQUEST}
                        component={ModalStackNavigators.EditRequestStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SIGN_IN}
                        component={ModalStackNavigators.SignInModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.REFERRAL}
                        component={ModalStackNavigators.ReferralModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.PRIVATE_NOTES}
                        component={ModalStackNavigators.PrivateNotesModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
