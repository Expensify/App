import {CardStyleInterpolators, createStackNavigator} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import _ from 'underscore';
import useThemeStyles from '@styles/useThemeStyles';
import SCREENS from '@src/SCREENS';

/**
 * Create a modal stack navigator with an array of sub-screens.
 *
 * @param {Object} screens key/value pairs where the key is the name of the screen and the value is a functon that returns the lazy-loaded component
 * @returns {Function}
 */
function createModalStackNavigator(screens) {
    const ModalStackNavigator = createStackNavigator();

    function ModalStack() {
        const styles = useThemeStyles();

        const defaultSubRouteOptions = useMemo(
            () => ({
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }),
            [styles],
        );

        return (
            <ModalStackNavigator.Navigator screenOptions={defaultSubRouteOptions}>
                {_.map(screens, (getComponent, name) => (
                    <ModalStackNavigator.Screen
                        key={name}
                        name={name}
                        getComponent={getComponent}
                    />
                ))}
            </ModalStackNavigator.Navigator>
        );
    }

    ModalStack.displayName = 'ModalStack';

    return ModalStack;
}

const MoneyRequestModalStackNavigator = createModalStackNavigator({
    [SCREENS.MONEY_REQUEST.ROOT]: () => require('../../../pages/iou/MoneyRequestSelectorPage').default,
    [SCREENS.MONEY_REQUEST.AMOUNT]: () => require('../../../pages/iou/steps/NewRequestAmountPage').default,
    [SCREENS.MONEY_REQUEST.PARTICIPANTS]: () => require('../../../pages/iou/steps/MoneyRequstParticipantsPage/MoneyRequestParticipantsPage').default,
    [SCREENS.MONEY_REQUEST.CONFIRMATION]: () => require('../../../pages/iou/steps/MoneyRequestConfirmPage').default,
    [SCREENS.MONEY_REQUEST.CURRENCY]: () => require('../../../pages/iou/IOUCurrencySelection').default,
    [SCREENS.MONEY_REQUEST.DATE]: () => require('../../../pages/iou/MoneyRequestDatePage').default,
    [SCREENS.MONEY_REQUEST.DESCRIPTION]: () => require('../../../pages/iou/MoneyRequestDescriptionPage').default,
    [SCREENS.MONEY_REQUEST.CATEGORY]: () => require('../../../pages/iou/MoneyRequestCategoryPage').default,
    [SCREENS.MONEY_REQUEST.TAG]: () => require('../../../pages/iou/MoneyRequestTagPage').default,
    [SCREENS.MONEY_REQUEST.MERCHANT]: () => require('../../../pages/iou/MoneyRequestMerchantPage').default,
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: () => require('../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: () => require('../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default,
    [SCREENS.MONEY_REQUEST.WAYPOINT]: () => require('../../../pages/iou/NewDistanceRequestWaypointEditorPage').default,
    [SCREENS.MONEY_REQUEST.EDIT_WAYPOINT]: () => require('../../../pages/iou/MoneyRequestEditWaypointPage').default,
    [SCREENS.MONEY_REQUEST.DISTANCE]: () => require('../../../pages/iou/NewDistanceRequestPage').default,
    [SCREENS.MONEY_REQUEST.RECEIPT]: () => require('../../../pages/EditRequestReceiptPage').default,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator({
    [SCREENS.SPLIT_DETAILS.ROOT]: () => require('../../../pages/iou/SplitBillDetailsPage').default,
    [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: () => require('../../../pages/EditSplitBillPage').default,
    [SCREENS.SPLIT_DETAILS.EDIT_CURRENCY]: () => require('../../../pages/iou/IOUCurrencySelection').default,
});

const DetailsModalStackNavigator = createModalStackNavigator({
    [SCREENS.DETAILS_ROOT]: () => require('../../../pages/DetailsPage').default,
});

const ProfileModalStackNavigator = createModalStackNavigator({
    [SCREENS.PROFILE_ROOT]: () => require('../../../pages/ProfilePage').default,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator({
    [SCREENS.REPORT_DETAILS.ROOT]: () => require('../../../pages/ReportDetailsPage').default,
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: () => require('../../../pages/home/report/ReportDetailsShareCodePage').default,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator({
    [SCREENS.REPORT_SETTINGS.ROOT]: () => require('../../../pages/settings/Report/ReportSettingsPage').default,
    [SCREENS.REPORT_SETTINGS.ROOM_NAME]: () => require('../../../pages/settings/Report/RoomNamePage').default,
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: () => require('../../../pages/settings/Report/NotificationPreferencePage').default,
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: () => require('../../../pages/settings/Report/WriteCapabilityPage').default,
});

const TaskModalStackNavigator = createModalStackNavigator({
    [SCREENS.TASK.TITLE]: () => require('../../../pages/tasks/TaskTitlePage').default,
    [SCREENS.TASK.DESCRIPTION]: () => require('../../../pages/tasks/TaskDescriptionPage').default,
    [SCREENS.TASK.ASSIGNEE]: () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default,
});

const ReportWelcomeMessageModalStackNavigator = createModalStackNavigator({
    [SCREENS.REPORT_WELCOME_MESSAGE_ROOT]: () => require('../../../pages/ReportWelcomeMessagePage').default,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator({
    [SCREENS.REPORT_PARTICIPANTS_ROOT]: () => require('../../../pages/ReportParticipantsPage').default,
});

const RoomMembersModalStackNavigator = createModalStackNavigator({
    [SCREENS.ROOM_MEMBERS_ROOT]: () => require('../../../pages/RoomMembersPage').default,
});

const RoomInviteModalStackNavigator = createModalStackNavigator({
    [SCREENS.ROOM_INVITE_ROOT]: () => require('../../../pages/RoomInvitePage').default,
});

const SearchModalStackNavigator = createModalStackNavigator({
    [SCREENS.SEARCH_ROOT]: () => require('../../../pages/SearchPage').default,
});

const NewChatModalStackNavigator = createModalStackNavigator({
    [SCREENS.NEW_CHAT_ROOT]: () => require('../../../pages/NewChatSelectorPage').default,
});

const NewTaskModalStackNavigator = createModalStackNavigator({
    [SCREENS.NEW_TASK.ROOT]: () => require('../../../pages/tasks/NewTaskPage').default,
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default,
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: () => require('../../../pages/tasks/TaskShareDestinationSelectorModal').default,
    [SCREENS.NEW_TASK.DETAILS]: () => require('../../../pages/tasks/NewTaskDetailsPage').default,
    [SCREENS.NEW_TASK.TITLE]: () => require('../../../pages/tasks/NewTaskTitlePage').default,
    [SCREENS.NEW_TASK.DESCRIPTION]: () => require('../../../pages/tasks/NewTaskDescriptionPage').default,
});

const NewTeachersUniteNavigator = createModalStackNavigator({
    [SCREENS.SAVE_THE_WORLD.ROOT]: () => require('../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.I_KNOW_A_TEACHER]: () => require('../../../pages/TeachersUnite/KnowATeacherPage').default,
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: () => require('../../../pages/TeachersUnite/ImTeacherPage').default,
    [SCREENS.I_AM_A_TEACHER]: () => require('../../../pages/TeachersUnite/ImTeacherPage').default,
});

const SettingsModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS.ROOT]: () => require('../../../pages/settings/InitialSettingsPage').default,
    [SCREENS.SETTINGS.SHARE_CODE]: () => require('../../../pages/ShareCodePage').default,
    [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../pages/workspace/WorkspacesListPage').default,
    [SCREENS.SETTINGS.PROFILE]: () => require('../../../pages/settings/Profile/ProfilePage').default,
    [SCREENS.SETTINGS.PRONOUNS]: () => require('../../../pages/settings/Profile/PronounsPage').default,
    [SCREENS.SETTINGS.DISPLAY_NAME]: () => require('../../../pages/settings/Profile/DisplayNamePage').default,
    [SCREENS.SETTINGS.TIMEZONE]: () => require('../../../pages/settings/Profile/TimezoneInitialPage').default,
    [SCREENS.SETTINGS.TIMEZONE_SELECT]: () => require('../../../pages/settings/Profile/TimezoneSelectPage').default,
    [SCREENS.SETTINGS.PERSONAL_DETAILS_INITIAL]: () => require('../../../pages/settings/Profile/PersonalDetails/PersonalDetailsInitialPage').default,
    [SCREENS.SETTINGS.PERSONAL_DETAILS_LEGAL_NAME]: () => require('../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default,
    [SCREENS.SETTINGS.PERSONAL_DETAILS_DATE_OF_BIRTH]: () => require('../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default,
    [SCREENS.SETTINGS.PERSONAL_DETAILS_ADDRESS]: () => require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default,
    [SCREENS.SETTINGS.PERSONAL_DETAILS_ADDRESS_COUNTRY]: () => require('../../../pages/settings/Profile/PersonalDetails/CountrySelectionPage').default,
    [SCREENS.SETTINGS.CONTACT_METHODS]: () => require('../../../pages/settings/Profile/Contacts/ContactMethodsPage').default,
    [SCREENS.SETTINGS.CONTACT_METHOD_DETAILS]: () => require('../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default,
    [SCREENS.SETTINGS.NEW_CONTACT_METHOD]: () => require('../../../pages/settings/Profile/Contacts/NewContactMethodPage').default,
    [SCREENS.SETTINGS.PREFERENCES]: () => require('../../../pages/settings/Preferences/PreferencesPage').default,
    [SCREENS.SETTINGS.PREFERENCES_PRIORITY_MODE]: () => require('../../../pages/settings/Preferences/PriorityModePage').default,
    [SCREENS.SETTINGS.PREFERENCES_LANGUAGE]: () => require('../../../pages/settings/Preferences/LanguagePage').default,
    // Will be uncommented as part of https://github.com/Expensify/App/issues/21670
    // [SCREENS.SETTINGS.PREFERENCES_THEME]: () => require('../../../pages/settings/Preferences/ThemePage').default,
    [SCREENS.SETTINGS.CLOSE]: () => require('../../../pages/settings/Security/CloseAccountPage').default,
    [SCREENS.SETTINGS.SECURITY]: () => require('../../../pages/settings/Security/SecuritySettingsPage').default,
    [SCREENS.SETTINGS.ABOUT]: () => require('../../../pages/settings/AboutPage/AboutPage').default,
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: () => require('../../../pages/settings/AppDownloadLinks').default,
    [SCREENS.SETTINGS.LOUNGE_ACCESS]: () => require('../../../pages/settings/Profile/LoungeAccessPage').default,
    [SCREENS.SETTINGS.WALLET]: () => require('../../../pages/settings/Wallet/WalletPage').default,
    [SCREENS.SETTINGS.WALLET_CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: () => require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default,
    [SCREENS.SETTINGS.WALLET_DOMAIN_CARD]: () => require('../../../pages/settings/Wallet/ExpensifyCardPage').default,
    [SCREENS.SETTINGS.WALLET_REPORT_VIRTUAL_CARD_FRAUD]: () => require('../../../pages/settings/Wallet/ReportVirtualCardFraudPage').default,
    [SCREENS.SETTINGS.WALLET_CARD_ACTIVATE]: () => require('../../../pages/settings/Wallet/ActivatePhysicalCardPage').default,
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.NAME]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardName').default,
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.PHONE]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardPhone').default,
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.ADDRESS]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardAddress').default,
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.CONFIRM]: () => require('../../../pages/settings/Wallet/Card/GetPhysicalCardConfirm').default,
    [SCREENS.SETTINGS.WALLET_TRANSFER_BALANCE]: () => require('../../../pages/settings/Wallet/TransferBalancePage').default,
    [SCREENS.SETTINGS.WALLET_CHOOSE_TRANSFER_ACCOUNT]: () => require('../../../pages/settings/Wallet/ChooseTransferAccountPage').default,
    [SCREENS.SETTINGS.WALLET_ENABLE_PAYMENTS]: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default,
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: () => require('../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: () => require('../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.SETTINGS.STATUS]: () => require('../../../pages/settings/Profile/CustomStatus/StatusPage').default,
    [SCREENS.SETTINGS.STATUS_SET]: () => require('../../../pages/settings/Profile/CustomStatus/StatusSetPage').default,
    [SCREENS.WORKSPACE.INITIAL]: () => require('../../../pages/workspace/WorkspaceInitialPage').default,
    [SCREENS.WORKSPACE.SETTINGS]: () => require('../../../pages/workspace/WorkspaceSettingsPage').default,
    [SCREENS.WORKSPACE.CURRENCY]: () => require('../../../pages/workspace/WorkspaceSettingsCurrencyPage').default,
    [SCREENS.WORKSPACE.CARD]: () => require('../../../pages/workspace/card/WorkspaceCardPage').default,
    [SCREENS.WORKSPACE.REIMBURSE]: () => require('../../../pages/workspace/reimburse/WorkspaceReimbursePage').default,
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: () => require('../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage').default,
    [SCREENS.WORKSPACE.BILLS]: () => require('../../../pages/workspace/bills/WorkspaceBillsPage').default,
    [SCREENS.WORKSPACE.INVOICES]: () => require('../../../pages/workspace/invoices/WorkspaceInvoicesPage').default,
    [SCREENS.WORKSPACE.TRAVEL]: () => require('../../../pages/workspace/travel/WorkspaceTravelPage').default,
    [SCREENS.WORKSPACE.MEMBERS]: () => require('../../../pages/workspace/WorkspaceMembersPage').default,
    [SCREENS.WORKSPACE.INVITE]: () => require('../../../pages/workspace/WorkspaceInvitePage').default,
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: () => require('../../../pages/workspace/WorkspaceInviteMessagePage').default,
    [SCREENS.REIMBURSEMENT_ACCOUNT]: () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
    [SCREENS.GET_ASSISTANCE]: () => require('../../../pages/GetAssistancePage').default,
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: () => require('../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: () => require('../../../pages/settings/Wallet/ReportCardLostPage').default,
    [SCREENS.KEYBOARD_SHORTCUTS]: () => require('../../../pages/KeyboardShortcutsPage').default,
});

const EnablePaymentsStackNavigator = createModalStackNavigator({
    [SCREENS.ENABLE_PAYMENTS_ROOT]: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator({
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: () => require('../../../pages/AddPersonalBankAccountPage').default,
});

const ReimbursementAccountModalStackNavigator = createModalStackNavigator({
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
});

const WalletStatementStackNavigator = createModalStackNavigator({
    [SCREENS.WALLET_STATEMENT_ROOT]: () => require('../../../pages/wallet/WalletStatementPage').default,
});

const FlagCommentStackNavigator = createModalStackNavigator({
    [SCREENS.FLAG_COMMENT_ROOT]: () => require('../../../pages/FlagCommentPage').default,
});

const EditRequestStackNavigator = createModalStackNavigator({
    [SCREENS.EDIT_REQUEST.ROOT]: () => require('../../../pages/EditRequestPage').default,
    [SCREENS.EDIT_REQUEST.CURRENCY]: () => require('../../../pages/iou/IOUCurrencySelection').default,
});

const PrivateNotesModalStackNavigator = createModalStackNavigator({
    [SCREENS.PRIVATE_NOTES.VIEW]: () => require('../../../pages/PrivateNotes/PrivateNotesViewPage').default,
    [SCREENS.PRIVATE_NOTES.LIST]: () => require('../../../pages/PrivateNotes/PrivateNotesListPage').default,
    [SCREENS.PRIVATE_NOTES.EDIT]: () => require('../../../pages/PrivateNotes/PrivateNotesEditPage').default,
});

const SignInModalStackNavigator = createModalStackNavigator({
    [SCREENS.SIGN_IN_ROOT]: () => require('../../../pages/signin/SignInModal').default,
});

const ReferralModalStackNavigator = createModalStackNavigator({
    [SCREENS.REFERRAL_DETAILS]: () => require('../../../pages/ReferralDetailsPage').default,
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
};
