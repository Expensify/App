import type {ParamListBase} from '@react-navigation/routers';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators, createStackNavigator} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import type {
    AddPersonalBankAccountNavigatorParamList,
    DetailsNavigatorParamList,
    EditRequestNavigatorParamList,
    EnablePaymentsNavigatorParamList,
    FlagCommentNavigatorParamList,
    MoneyRequestNavigatorParamList,
    NewChatNavigatorParamList,
    NewTaskNavigatorParamList,
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ProfileNavigatorParamList,
    ReferralDetailsNavigatorParamList,
    ReimbursementAccountNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    ReportWelcomeMessageNavigatorParamList,
    RoomInviteNavigatorParamList,
    RoomMembersNavigatorParamList,
    SearchNavigatorParamList,
    SettingsNavigatorParamList,
    SignInNavigatorParamList,
    SplitDetailsNavigatorParamList,
    TaskDetailsNavigatorParamList,
    TeachersUniteNavigatorParamList,
    WalletStatementNavigatorParamList,
} from '@navigation/types';
import SCREENS from '@src/SCREENS';
import type {Screen} from '@src/SCREENS';

type Screens = Partial<Record<Screen, () => React.ComponentType>>;

/**
 * Create a modal stack navigator with an array of sub-screens.
 *
 * @param screens key/value pairs where the key is the name of the screen and the value is a functon that returns the lazy-loaded component
 */
function createModalStackNavigator<TStackParams extends ParamListBase>(screens: Screens): React.ComponentType {
    const ModalStackNavigator = createStackNavigator<TStackParams>();

    function ModalStack() {
        const styles = useThemeStyles();

        const defaultSubRouteOptions = useMemo(
            (): StackNavigationOptions => ({
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                keyboardHandlingEnabled: false,
            }),
            [styles],
        );

        return (
            <ModalStackNavigator.Navigator screenOptions={defaultSubRouteOptions}>
                {Object.keys(screens as Required<Screens>).map((name) => (
                    <ModalStackNavigator.Screen
                        key={name}
                        name={name}
                        getComponent={(screens as Required<Screens>)[name as Screen]}
                    />
                ))}
            </ModalStackNavigator.Navigator>
        );
    }

    ModalStack.displayName = 'ModalStack';

    return ModalStack;
}

const MoneyRequestModalStackNavigator = createModalStackNavigator<MoneyRequestNavigatorParamList>({
    [SCREENS.MONEY_REQUEST.START]: () => require('../../../pages/iou/request/IOURequestRedirectToStartPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.CREATE]: () => require('../../../pages/iou/request/IOURequestStartPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: () => require('../../../pages/iou/request/step/IOURequestStepConfirmation').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: () => require('../../../pages/iou/request/step/IOURequestStepAmount').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: () => require('../../../pages/iou/request/step/IOURequestStepTaxAmountPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: () => require('../../../pages/iou/request/step/IOURequestStepTaxRatePage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: () => require('../../../pages/iou/request/step/IOURequestStepCategory').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_CURRENCY]: () => require('../../../pages/iou/request/step/IOURequestStepCurrency').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DATE]: () => require('../../../pages/iou/request/step/IOURequestStepDate').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: () => require('../../../pages/iou/request/step/IOURequestStepDescription').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: () => require('../../../pages/iou/request/step/IOURequestStepDistance').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: () => require('../../../pages/iou/request/step/IOURequestStepMerchant').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: () => require('../../../pages/iou/request/step/IOURequestStepParticipants').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: () => require('../../../pages/iou/request/step/IOURequestStepScan').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_TAG]: () => require('../../../pages/iou/request/step/IOURequestStepTag').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: () => require('../../../pages/iou/request/step/IOURequestStepWaypoint').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.ROOT]: () => require('../../../pages/iou/MoneyRequestSelectorPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.AMOUNT]: () => require('../../../pages/iou/steps/NewRequestAmountPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.PARTICIPANTS]: () => require('../../../pages/iou/steps/MoneyRequstParticipantsPage/MoneyRequestParticipantsPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.CONFIRMATION]: () => require('../../../pages/iou/steps/MoneyRequestConfirmPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.CURRENCY]: () => require('../../../pages/iou/IOUCurrencySelection').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.DATE]: () => require('../../../pages/iou/MoneyRequestDatePage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.DESCRIPTION]: () => require('../../../pages/iou/MoneyRequestDescriptionPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.CATEGORY]: () => require('../../../pages/iou/MoneyRequestCategoryPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.TAG]: () => require('../../../pages/iou/MoneyRequestTagPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.MERCHANT]: () => require('../../../pages/iou/MoneyRequestMerchantPage').default as React.ComponentType,
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: () => require('../../../pages/AddPersonalBankAccountPage').default as React.ComponentType,
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: () => require('../../../pages/settings/Wallet/AddDebitCardPage').default as React.ComponentType,
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.WAYPOINT]: () => require('../../../pages/iou/MoneyRequestWaypointPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.DISTANCE]: () => require('../../../pages/iou/NewDistanceRequestPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.RECEIPT]: () => require('../../../pages/EditRequestReceiptPage').default as React.ComponentType,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator<SplitDetailsNavigatorParamList>({
    [SCREENS.SPLIT_DETAILS.ROOT]: () => require('../../../pages/iou/SplitBillDetailsPage').default as React.ComponentType,
    [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: () => require('../../../pages/EditSplitBillPage').default as React.ComponentType,
    [SCREENS.SPLIT_DETAILS.EDIT_CURRENCY]: () => require('../../../pages/iou/IOUCurrencySelection').default as React.ComponentType,
});

const DetailsModalStackNavigator = createModalStackNavigator<DetailsNavigatorParamList>({
    [SCREENS.DETAILS_ROOT]: () => require('../../../pages/DetailsPage').default as React.ComponentType,
});

const ProfileModalStackNavigator = createModalStackNavigator<ProfileNavigatorParamList>({
    [SCREENS.PROFILE_ROOT]: () => require('../../../pages/ProfilePage').default as React.ComponentType,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator<ReportDetailsNavigatorParamList>({
    [SCREENS.REPORT_DETAILS.ROOT]: () => require('../../../pages/ReportDetailsPage').default as React.ComponentType,
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: () => require('../../../pages/home/report/ReportDetailsShareCodePage').default as React.ComponentType,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator<ReportSettingsNavigatorParamList>({
    [SCREENS.REPORT_SETTINGS.ROOT]: () => require('../../../pages/settings/Report/ReportSettingsPage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.ROOM_NAME]: () => require('../../../pages/settings/Report/RoomNamePage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: () => require('../../../pages/settings/Report/NotificationPreferencePage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: () => require('../../../pages/settings/Report/WriteCapabilityPage').default as React.ComponentType,
});

const TaskModalStackNavigator = createModalStackNavigator<TaskDetailsNavigatorParamList>({
    [SCREENS.TASK.TITLE]: () => require('../../../pages/tasks/TaskTitlePage').default as React.ComponentType,
    [SCREENS.TASK.DESCRIPTION]: () => require('../../../pages/tasks/TaskDescriptionPage').default as React.ComponentType,
    [SCREENS.TASK.ASSIGNEE]: () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default as React.ComponentType,
});

const ReportWelcomeMessageModalStackNavigator = createModalStackNavigator<ReportWelcomeMessageNavigatorParamList>({
    [SCREENS.REPORT_WELCOME_MESSAGE_ROOT]: () => require('../../../pages/ReportWelcomeMessagePage').default as React.ComponentType,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator<ParticipantsNavigatorParamList>({
    [SCREENS.REPORT_PARTICIPANTS_ROOT]: () => require('../../../pages/ReportParticipantsPage').default as React.ComponentType,
});

const RoomMembersModalStackNavigator = createModalStackNavigator<RoomMembersNavigatorParamList>({
    [SCREENS.ROOM_MEMBERS_ROOT]: () => require('../../../pages/RoomMembersPage').default as React.ComponentType,
});

const RoomInviteModalStackNavigator = createModalStackNavigator<RoomInviteNavigatorParamList>({
    [SCREENS.ROOM_INVITE_ROOT]: () => require('../../../pages/RoomInvitePage').default as React.ComponentType,
});

const SearchModalStackNavigator = createModalStackNavigator<SearchNavigatorParamList>({
    [SCREENS.SEARCH_ROOT]: () => require('../../../pages/SearchPage').default as React.ComponentType,
});

const NewChatModalStackNavigator = createModalStackNavigator<NewChatNavigatorParamList>({
    [SCREENS.NEW_CHAT.ROOT]: () => require('../../../pages/NewChatSelectorPage').default as React.ComponentType,
});

const NewTaskModalStackNavigator = createModalStackNavigator<NewTaskNavigatorParamList>({
    [SCREENS.NEW_TASK.ROOT]: () => require('../../../pages/tasks/NewTaskPage').default as React.ComponentType,
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default as React.ComponentType,
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: () => require('../../../pages/tasks/TaskShareDestinationSelectorModal').default as React.ComponentType,
    [SCREENS.NEW_TASK.DETAILS]: () => require('../../../pages/tasks/NewTaskDetailsPage').default as React.ComponentType,
    [SCREENS.NEW_TASK.TITLE]: () => require('../../../pages/tasks/NewTaskTitlePage').default as React.ComponentType,
    [SCREENS.NEW_TASK.DESCRIPTION]: () => require('../../../pages/tasks/NewTaskDescriptionPage').default as React.ComponentType,
});

const NewTeachersUniteNavigator = createModalStackNavigator<TeachersUniteNavigatorParamList>({
    [SCREENS.SAVE_THE_WORLD.ROOT]: () => require('../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType,
    [SCREENS.I_KNOW_A_TEACHER]: () => require('../../../pages/TeachersUnite/KnowATeacherPage').default as React.ComponentType,
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: () => require('../../../pages/TeachersUnite/ImTeacherPage').default as React.ComponentType,
    [SCREENS.I_AM_A_TEACHER]: () => require('../../../pages/TeachersUnite/ImTeacherPage').default as React.ComponentType,
});

const SettingsModalStackNavigator = createModalStackNavigator<SettingsNavigatorParamList>({
    [SCREENS.SETTINGS.ROOT]: () => require('../../../pages/settings/InitialSettingsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SHARE_CODE]: () => require('../../../pages/ShareCodePage').default as React.ComponentType,
    [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../pages/workspace/WorkspacesListPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require('../../../pages/settings/Profile/ProfilePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: () => require('../../../pages/settings/Profile/PronounsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: () => require('../../../pages/settings/Profile/DisplayNamePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: () => require('../../../pages/settings/Profile/TimezoneInitialPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: () => require('../../../pages/settings/Profile/TimezoneSelectPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.INITIAL]: () => require('../../../pages/settings/Profile/PersonalDetails/PersonalDetailsInitialPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.LEGAL_NAME]: () => require('../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.DATE_OF_BIRTH]: () => require('../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.ADDRESS]: () => require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.ADDRESS_COUNTRY]: () => require('../../../pages/settings/Profile/PersonalDetails/CountrySelectionPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: () => require('../../../pages/settings/Profile/Contacts/ContactMethodsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: () => require('../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: () => require('../../../pages/settings/Profile/Contacts/NewContactMethodPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require('../../../pages/settings/Preferences/PreferencesPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: () => require('../../../pages/settings/Preferences/PriorityModePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: () => require('../../../pages/settings/Preferences/LanguagePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.THEME]: () => require('../../../pages/settings/Preferences/ThemePage').default as React.ComponentType,
    [SCREENS.SETTINGS.CLOSE]: () => require('../../../pages/settings/Security/CloseAccountPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SECURITY]: () => require('../../../pages/settings/Security/SecuritySettingsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ABOUT]: () => require('../../../pages/settings/AboutPage/AboutPage').default as React.ComponentType,
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: () => require('../../../pages/settings/AppDownloadLinks').default as React.ComponentType,
    [SCREENS.SETTINGS.LOUNGE_ACCESS]: () => require('../../../pages/settings/Profile/LoungeAccessPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require('../../../pages/settings/Wallet/WalletPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: () => require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: () => require('../../../pages/settings/Wallet/ExpensifyCardPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: () => require('../../../pages/settings/Wallet/ReportVirtualCardFraudPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: () => require('../../../pages/settings/Wallet/ActivatePhysicalCardPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardName').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardPhone').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardAddress').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardConfirm').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: () => require('../../../pages/settings/Wallet/TransferBalancePage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: () => require('../../../pages/settings/Wallet/ChooseTransferAccountPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: () => require('../../../pages/settings/Wallet/AddDebitCardPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: () => require('../../../pages/AddPersonalBankAccountPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS]: () => require('../../../pages/settings/Profile/CustomStatus/StatusPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: () => require('../../../pages/settings/Profile/CustomStatus/StatusClearAfterPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: () => require('../../../pages/settings/Profile/CustomStatus/SetDatePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: () => require('../../../pages/settings/Profile/CustomStatus/SetTimePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INITIAL]: () => require('../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.SETTINGS]: () => require('../../../pages/workspace/WorkspaceSettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CURRENCY]: () => require('../../../pages/workspace/WorkspaceSettingsCurrencyPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CARD]: () => require('../../../pages/workspace/card/WorkspaceCardPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.REIMBURSE]: () => require('../../../pages/workspace/reimburse/WorkspaceReimbursePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: () => require('../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.BILLS]: () => require('../../../pages/workspace/bills/WorkspaceBillsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INVOICES]: () => require('../../../pages/workspace/invoices/WorkspaceInvoicesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TRAVEL]: () => require('../../../pages/workspace/travel/WorkspaceTravelPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.MEMBERS]: () => require('../../../pages/workspace/WorkspaceMembersPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INVITE]: () => require('../../../pages/workspace/WorkspaceInvitePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: () => require('../../../pages/workspace/WorkspaceInviteMessagePage').default as React.ComponentType,
    [SCREENS.REIMBURSEMENT_ACCOUNT]: () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default as React.ComponentType,
    [SCREENS.GET_ASSISTANCE]: () => require('../../../pages/GetAssistancePage').default as React.ComponentType,
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: () => require('../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default as React.ComponentType,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: () => require('../../../pages/settings/Wallet/ReportCardLostPage').default as React.ComponentType,
    [SCREENS.KEYBOARD_SHORTCUTS]: () => require('../../../pages/KeyboardShortcutsPage').default as React.ComponentType,
});

const EnablePaymentsStackNavigator = createModalStackNavigator<EnablePaymentsNavigatorParamList>({
    [SCREENS.ENABLE_PAYMENTS_ROOT]: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default as React.ComponentType,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator<AddPersonalBankAccountNavigatorParamList>({
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: () => require('../../../pages/AddPersonalBankAccountPage').default as React.ComponentType,
});

const ReimbursementAccountModalStackNavigator = createModalStackNavigator<ReimbursementAccountNavigatorParamList>({
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default as React.ComponentType,
});

const WalletStatementStackNavigator = createModalStackNavigator<WalletStatementNavigatorParamList>({
    [SCREENS.WALLET_STATEMENT_ROOT]: () => require('../../../pages/wallet/WalletStatementPage').default as React.ComponentType,
});

const FlagCommentStackNavigator = createModalStackNavigator<FlagCommentNavigatorParamList>({
    [SCREENS.FLAG_COMMENT_ROOT]: () => require('../../../pages/FlagCommentPage').default as React.ComponentType,
});

const EditRequestStackNavigator = createModalStackNavigator<EditRequestNavigatorParamList>({
    [SCREENS.EDIT_REQUEST.ROOT]: () => require('../../../pages/EditRequestPage').default as React.ComponentType,
    [SCREENS.EDIT_REQUEST.CURRENCY]: () => require('../../../pages/iou/IOUCurrencySelection').default as React.ComponentType,
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: () => require('../../../pages/EditReportFieldPage').default as React.ComponentType,
});

const PrivateNotesModalStackNavigator = createModalStackNavigator<PrivateNotesNavigatorParamList>({
    [SCREENS.PRIVATE_NOTES.LIST]: () => require('../../../pages/PrivateNotes/PrivateNotesListPage').default as React.ComponentType,
    [SCREENS.PRIVATE_NOTES.EDIT]: () => require('../../../pages/PrivateNotes/PrivateNotesEditPage').default as React.ComponentType,
});

const SignInModalStackNavigator = createModalStackNavigator<SignInNavigatorParamList>({
    [SCREENS.SIGN_IN_ROOT]: () => require('../../../pages/signin/SignInModal').default as React.ComponentType,
});

const ReferralModalStackNavigator = createModalStackNavigator<ReferralDetailsNavigatorParamList>({
    [SCREENS.REFERRAL_DETAILS]: () => require('../../../pages/ReferralDetailsPage').default as React.ComponentType,
});

const ProcessMoneyRequestHoldStackNavigator = createModalStackNavigator({
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: () => require('../../../pages/ProcessMoneyRequestHoldPage').default as React.ComponentType,
});

export {
    MoneyRequestModalStackNavigator,
    SplitDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ProfileModalStackNavigator,
    ReportDetailsModalStackNavigator,
    TaskModalStackNavigator,
    ReportSettingsModalStackNavigator,
    ReportWelcomeMessageModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewChatModalStackNavigator,
    NewTaskModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    WalletStatementStackNavigator,
    FlagCommentStackNavigator,
    EditRequestStackNavigator,
    PrivateNotesModalStackNavigator,
    NewTeachersUniteNavigator,
    SignInModalStackNavigator,
    RoomMembersModalStackNavigator,
    RoomInviteModalStackNavigator,
    ReferralModalStackNavigator,
    ProcessMoneyRequestHoldStackNavigator,
};
