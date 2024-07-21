import type {StackCardInterpolationProps, StackScreenProps} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {abandonReviewDuplicateTransactions} from '@libs/actions/Transaction';
import {isSafari} from '@libs/Browser';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import createModalCardStyleInterpolator from '@navigation/AppNavigator/createModalCardStyleInterpolator';
import type {AuthScreensParamList, RightModalNavigatorParamList} from '@navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type RightModalNavigatorProps = StackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

const Stack = createStackNavigator<RightModalNavigatorParamList>();

function RightModalNavigator({navigation, route}: RightModalNavigatorProps) {
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const isExecutingRef = useRef<boolean>(false);
    const screenOptions = useMemo(() => {
        const options = ModalNavigatorScreenOptions(styles);
        // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
        if (isSafari()) {
            const customInterpolator = createModalCardStyleInterpolator(styleUtils);
            options.cardStyleInterpolator = (props: StackCardInterpolationProps) => customInterpolator(isSmallScreenWidth, false, false, props);
        }

        return options;
    }, [isSmallScreenWidth, styleUtils, styles]);

    return (
        <NoDropZone>
            {!isSmallScreenWidth && (
                <Overlay
                    onPress={() => {
                        if (isExecutingRef.current) {
                            return;
                        }
                        isExecutingRef.current = true;
                        navigation.goBack();
                    }}
                />
            )}
            <View style={styles.RHPNavigatorContainer(isSmallScreenWidth)}>
                <Stack.Navigator
                    screenOptions={screenOptions}
                    screenListeners={{
                        blur: () => {
                            if (
                                // @ts-expect-error There is something wrong with a types here and it's don't see the params list
                                navigation.getState().routes.find((routes) => routes.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.params?.screen ===
                                    SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE ||
                                route.params?.screen !== SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE
                            ) {
                                return;
                            }
                            abandonReviewDuplicateTransactions();
                        },
                    }}
                    id={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                >
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SETTINGS}
                        component={ModalStackNavigators.SettingsModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.NEW_CHAT}
                        component={ModalStackNavigators.NewChatModalStackNavigator}
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
                        name={SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION}
                        component={ModalStackNavigators.ReportDescriptionModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SETTINGS_CATEGORIES}
                        component={ModalStackNavigators.CategoriesModalStackNavigator}
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
                    <Stack.Screen
                        name="ProcessMoneyRequestHold"
                        component={ModalStackNavigators.ProcessMoneyRequestHoldStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE}
                        component={ModalStackNavigators.TransactionDuplicateStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.TRAVEL}
                        component={ModalStackNavigators.TravelModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SEARCH_REPORT}
                        component={ModalStackNavigators.SearchReportModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.RESTRICTED_ACTION}
                        component={ModalStackNavigators.RestrictedActionModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.RIGHT_MODAL.SEARCH_ADVANCED_FILTERS}
                        component={ModalStackNavigators.SearchAdvancedFiltersModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
