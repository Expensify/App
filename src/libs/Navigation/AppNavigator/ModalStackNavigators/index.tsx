import type {ParamListBase} from '@react-navigation/routers';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import type {
    AddPersonalBankAccountNavigatorParamList,
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
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    RoomInviteNavigatorParamList,
    RoomMembersNavigatorParamList,
    SearchReportParamList,
    SettingsNavigatorParamList,
    SignInNavigatorParamList,
    SplitDetailsNavigatorParamList,
    TaskDetailsNavigatorParamList,
    TeachersUniteNavigatorParamList,
    TransactionDuplicateNavigatorParamList,
    TravelNavigatorParamList,
    WalletStatementNavigatorParamList,
} from '@navigation/types';
import type {ThemeStyles} from '@styles/index';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import useModalScreenOptions from './useModalScreenOptions';

type Screens = Partial<Record<Screen, () => React.ComponentType>>;

/**
 * Create a modal stack navigator with an array of sub-screens.
 *
 * @param screens key/value pairs where the key is the name of the screen and the value is a functon that returns the lazy-loaded component
 * @param getScreenOptions optional function that returns the screen options, override the default options
 */
function createModalStackNavigator<TStackParams extends ParamListBase>(screens: Screens, getScreenOptions?: (styles: ThemeStyles) => StackNavigationOptions): React.ComponentType {
    const ModalStackNavigator = createStackNavigator<TStackParams>();

    function ModalStack() {
        const screenOptions = useModalScreenOptions(getScreenOptions);

        return (
            <ModalStackNavigator.Navigator screenOptions={screenOptions}>
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
    [SCREENS.MONEY_REQUEST.START]: () => require('../../../../pages/iou/request/IOURequestRedirectToStartPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.CREATE]: () => require('../../../../pages/iou/request/IOURequestStartPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: () => require('../../../../pages/iou/request/step/IOURequestStepConfirmation').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: () => require('../../../../pages/iou/request/step/IOURequestStepAmount').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: () => require('../../../../pages/iou/request/step/IOURequestStepTaxAmountPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: () => require('../../../../pages/iou/request/step/IOURequestStepTaxRatePage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: () => require('../../../../pages/iou/request/step/IOURequestStepCategory').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_CURRENCY]: () => require('../../../../pages/iou/request/step/IOURequestStepCurrency').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DATE]: () => require('../../../../pages/iou/request/step/IOURequestStepDate').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: () => require('../../../../pages/iou/request/step/IOURequestStepDescription').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: () => require('../../../../pages/iou/request/step/IOURequestStepDistance').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: () => require('@pages/iou/request/step/IOURequestStepDistanceRate').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: () => require('../../../../pages/iou/request/step/IOURequestStepMerchant').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: () => require('../../../../pages/iou/request/step/IOURequestStepParticipants').default as React.ComponentType,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT]: () => require('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: () => require('../../../../pages/iou/request/step/IOURequestStepScan').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_TAG]: () => require('../../../../pages/iou/request/step/IOURequestStepTag').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: () => require('../../../../pages/iou/request/step/IOURequestStepWaypoint').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_SPLIT_PAYER]: () => require('../../../../pages/iou/request/step/IOURequestStepSplitPayer').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: () => require('../../../../pages/iou/request/step/IOURequestStepSendFrom').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.HOLD]: () => require('../../../../pages/iou/HoldReasonPage').default as React.ComponentType,
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: () => require('../../../../pages/AddPersonalBankAccountPage').default as React.ComponentType,
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: () => require('../../../../pages/settings/Wallet/AddDebitCardPage').default as React.ComponentType,
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: () => require('../../../../pages/EnablePayments/EnablePaymentsPage').default as React.ComponentType,
    [SCREENS.MONEY_REQUEST.STATE_SELECTOR]: () => require('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default as React.ComponentType,
});

const TravelModalStackNavigator = createModalStackNavigator<TravelNavigatorParamList>({
    [SCREENS.TRAVEL.MY_TRIPS]: () => require('../../../../pages/Travel/MyTripsPage').default as React.ComponentType,
    [SCREENS.TRAVEL.TCS]: () => require('../../../../pages/Travel/TravelTerms').default as React.ComponentType,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator<SplitDetailsNavigatorParamList>({
    [SCREENS.SPLIT_DETAILS.ROOT]: () => require('../../../../pages/iou/SplitBillDetailsPage').default as React.ComponentType,
});

const ProfileModalStackNavigator = createModalStackNavigator<ProfileNavigatorParamList>({
    [SCREENS.PROFILE_ROOT]: () => require('../../../../pages/ProfilePage').default as React.ComponentType,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator<ReportDetailsNavigatorParamList>({
    [SCREENS.REPORT_DETAILS.ROOT]: () => require('../../../../pages/ReportDetailsPage').default as React.ComponentType,
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: () => require('../../../../pages/home/report/ReportDetailsShareCodePage').default as React.ComponentType,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator<ReportSettingsNavigatorParamList>({
    [SCREENS.REPORT_SETTINGS.ROOT]: () => require('../../../../pages/settings/Report/ReportSettingsPage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.NAME]: () => require('../../../../pages/settings/Report/NamePage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: () => require('../../../../pages/settings/Report/NotificationPreferencePage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: () => require('../../../../pages/settings/Report/WriteCapabilityPage').default as React.ComponentType,
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: () => require('../../../../pages/settings/Report/VisibilityPage').default as React.ComponentType,
});

const TaskModalStackNavigator = createModalStackNavigator<TaskDetailsNavigatorParamList>({
    [SCREENS.TASK.TITLE]: () => require('../../../../pages/tasks/TaskTitlePage').default as React.ComponentType,
    [SCREENS.TASK.ASSIGNEE]: () => require('../../../../pages/tasks/TaskAssigneeSelectorModal').default as React.ComponentType,
});

const ReportDescriptionModalStackNavigator = createModalStackNavigator<ReportDescriptionNavigatorParamList>({
    [SCREENS.REPORT_DESCRIPTION_ROOT]: () => require('../../../../pages/ReportDescriptionPage').default as React.ComponentType,
});

const CategoriesModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS]: () => require('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default as React.ComponentType,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE]: () => require('../../../../pages/workspace/categories/CreateCategoryPage').default as React.ComponentType,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT]: () => require('../../../../pages/workspace/categories/EditCategoryPage').default as React.ComponentType,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS]: () => require('../../../../pages/workspace/categories/CategorySettingsPage').default as React.ComponentType,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator<ParticipantsNavigatorParamList>({
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: () => require('../../../../pages/ReportParticipantsPage').default as React.ComponentType,
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: () => require('../../../../pages/InviteReportParticipantsPage').default as React.ComponentType,
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: () => require('../../../../pages/ReportParticipantDetailsPage').default as React.ComponentType,
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: () => require('../../../../pages/ReportParticipantRoleSelectionPage').default as React.ComponentType,
});

const RoomMembersModalStackNavigator = createModalStackNavigator<RoomMembersNavigatorParamList>({
    [SCREENS.ROOM_MEMBERS_ROOT]: () => require('../../../../pages/RoomMembersPage').default as React.ComponentType,
});

const RoomInviteModalStackNavigator = createModalStackNavigator<RoomInviteNavigatorParamList>({
    [SCREENS.ROOM_INVITE_ROOT]: () => require('../../../../pages/RoomInvitePage').default as React.ComponentType,
});

const NewChatModalStackNavigator = createModalStackNavigator<NewChatNavigatorParamList>({
    [SCREENS.NEW_CHAT.ROOT]: () => require('../../../../pages/NewChatSelectorPage').default as React.ComponentType,
    [SCREENS.NEW_CHAT.NEW_CHAT_CONFIRM]: () => require('../../../../pages/NewChatConfirmPage').default as React.ComponentType,
    [SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME]: () => require('../../../../pages/GroupChatNameEditPage').default as React.ComponentType,
});

const NewTaskModalStackNavigator = createModalStackNavigator<NewTaskNavigatorParamList>({
    [SCREENS.NEW_TASK.ROOT]: () => require('../../../../pages/tasks/NewTaskPage').default as React.ComponentType,
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: () => require('../../../../pages/tasks/TaskAssigneeSelectorModal').default as React.ComponentType,
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: () => require('../../../../pages/tasks/TaskShareDestinationSelectorModal').default as React.ComponentType,
    [SCREENS.NEW_TASK.DETAILS]: () => require('../../../../pages/tasks/NewTaskDetailsPage').default as React.ComponentType,
    [SCREENS.NEW_TASK.TITLE]: () => require('../../../../pages/tasks/NewTaskTitlePage').default as React.ComponentType,
    [SCREENS.NEW_TASK.DESCRIPTION]: () => require('../../../../pages/tasks/NewTaskDescriptionPage').default as React.ComponentType,
});

const NewTeachersUniteNavigator = createModalStackNavigator<TeachersUniteNavigatorParamList>({
    [SCREENS.SAVE_THE_WORLD.ROOT]: () => require('../../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType,
    [SCREENS.I_KNOW_A_TEACHER]: () => require('../../../../pages/TeachersUnite/KnowATeacherPage').default as React.ComponentType,
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: () => require('../../../../pages/TeachersUnite/ImTeacherPage').default as React.ComponentType,
    [SCREENS.I_AM_A_TEACHER]: () => require('../../../../pages/TeachersUnite/ImTeacherPage').default as React.ComponentType,
});

const SettingsModalStackNavigator = createModalStackNavigator<SettingsNavigatorParamList>({
    [SCREENS.SETTINGS.SHARE_CODE]: () => require('../../../../pages/ShareCodePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: () => require('../../../../pages/settings/Profile/PronounsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: () => require('../../../../pages/settings/Profile/DisplayNamePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: () => require('../../../../pages/settings/Profile/TimezoneInitialPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: () => require('../../../../pages/settings/Profile/TimezoneSelectPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: () => require('../../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: () => require('../../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: () => require('../../../../pages/settings/Profile/PersonalDetails/AddressPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: () => require('../../../../pages/settings/Profile/PersonalDetails/CountrySelectionPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ADDRESS_STATE]: () => require('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: () => require('../../../../pages/settings/Profile/Contacts/ContactMethodsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: () => require('../../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: () => require('../../../../pages/settings/Profile/Contacts/NewContactMethodPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: () => require('../../../../pages/settings/Preferences/PriorityModePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require('../../../../pages/workspace/accounting/PolicyAccountingPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: () => require('../../../../pages/settings/Preferences/LanguagePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.THEME]: () => require('../../../../pages/settings/Preferences/ThemePage').default as React.ComponentType,
    [SCREENS.SETTINGS.CLOSE]: () => require('../../../../pages/settings/Security/CloseAccountPage').default as React.ComponentType,
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: () => require('../../../../pages/settings/AppDownloadLinks').default as React.ComponentType,
    [SCREENS.SETTINGS.CONSOLE]: () => require('../../../../pages/settings/AboutPage/ConsolePage').default as React.ComponentType,
    [SCREENS.SETTINGS.SHARE_LOG]: () => require('../../../../pages/settings/AboutPage/ShareLogPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: () => require('../../../../pages/settings/Profile/PersonalDetails/AddressPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: () => require('../../../../pages/settings/Wallet/ExpensifyCardPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: () => require('../../../../pages/settings/Wallet/ReportVirtualCardFraudPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: () => require('../../../../pages/settings/Wallet/ActivatePhysicalCardPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: () => require('../../../../pages/settings/Wallet/Card/GetPhysicalCardName').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: () => require('../../../../pages/settings/Wallet/Card/GetPhysicalCardPhone').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: () => require('../../../../pages/settings/Wallet/Card/GetPhysicalCardAddress').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: () => require('../../../../pages/settings/Wallet/Card/GetPhysicalCardConfirm').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: () => require('../../../../pages/settings/Wallet/TransferBalancePage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: () => require('../../../../pages/settings/Wallet/ChooseTransferAccountPage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: () => require('../../../../pages/EnablePayments/EnablePayments').default as React.ComponentType,
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: () => require('../../../../pages/settings/Wallet/AddDebitCardPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: () => require('../../../../pages/AddPersonalBankAccountPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS]: () => require('../../../../pages/settings/Profile/CustomStatus/StatusPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: () => require('../../../../pages/settings/Profile/CustomStatus/StatusClearAfterPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: () => require('../../../../pages/settings/Profile/CustomStatus/SetDatePage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: () => require('../../../../pages/settings/Profile/CustomStatus/SetTimePage').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: () => require('../../../../pages/settings/Subscription/SubscriptionSize').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.DISABLE_AUTO_RENEW_SURVEY]: () => require('../../../../pages/settings/Subscription/DisableAutoRenewSurveyPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: () => require('../../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage/InitialPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.RATE_AND_UNIT_RATE]: () => require('../../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage/RatePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.RATE_AND_UNIT_UNIT]: () => require('../../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage/UnitPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INVITE]: () => require('../../../../pages/workspace/WorkspaceInvitePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVER]: () => require('../../../../pages/workspace/workflows/WorkspaceWorkflowsApproverPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: () => require('../../../../pages/workspace/WorkspaceInviteMessagePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: () => require('../../../../pages/workspace/workflows/WorkspaceWorkflowsPayerPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.NAME]: () => require('../../../../pages/workspace/WorkspaceNamePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DESCRIPTION]: () => require('../../../../pages/workspace/WorkspaceProfileDescriptionPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.SHARE]: () => require('../../../../pages/workspace/WorkspaceProfileSharePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CURRENCY]: () => require('../../../../pages/workspace/WorkspaceProfileCurrencyPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: () => require('../../../../pages/workspace/categories/CategorySettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ADDRESS]: () => require('../../../../pages/workspace/WorkspaceProfileAddressPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: () => require('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.MEMBER_DETAILS]: () => require('../../../../pages/workspace/members/WorkspaceMemberDetailsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.OWNER_CHANGE_CHECK]: () => require('@pages/workspace/members/WorkspaceOwnerChangeWrapperPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS]: () => require('../../../../pages/workspace/members/WorkspaceOwnerChangeSuccessPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.OWNER_CHANGE_ERROR]: () => require('../../../../pages/workspace/members/WorkspaceOwnerChangeErrorPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CATEGORY_CREATE]: () => require('../../../../pages/workspace/categories/CreateCategoryPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CATEGORY_EDIT]: () => require('../../../../pages/workspace/categories/EditCategoryPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: () => require('../../../../pages/workspace/distanceRates/CreateDistanceRatePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: () => require('../../../../pages/workspace/distanceRates/PolicyDistanceRatesSettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS]: () => require('../../../../pages/workspace/distanceRates/PolicyDistanceRateDetailsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DISTANCE_RATE_EDIT]: () => require('../../../../pages/workspace/distanceRates/PolicyDistanceRateEditPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT]: () =>
        require('../../../../pages/workspace/distanceRates/PolicyDistanceRateTaxReclaimableEditPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT]: () => require('../../../../pages/workspace/distanceRates/PolicyDistanceRateTaxRateEditPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAGS_SETTINGS]: () => require('../../../../pages/workspace/tags/WorkspaceTagsSettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAG_SETTINGS]: () => require('../../../../pages/workspace/tags/TagSettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: () => require('../../../../pages/workspace/tags/WorkspaceViewTagsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAGS_EDIT]: () => require('../../../../pages/workspace/tags/WorkspaceEditTagsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAG_CREATE]: () => require('../../../../pages/workspace/tags/WorkspaceCreateTagPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAG_EDIT]: () => require('../../../../pages/workspace/tags/EditTagPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAXES_SETTINGS]: () => require('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME]: () => require('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsCustomTaxName').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT]: () => require('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsForeignCurrency').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT]: () => require('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsWorkspaceCurrency').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportDateSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportInvoiceAccountSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseAccountSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseEntitySelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksNonReimbursableDefaultVendorSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: () =>
        require('@pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountSelectCardPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: () =>
        require('../../../../pages/workspace/accounting/qbo/export/QuickbooksPreferredExporterConfigurationPage').default as React.ComponentType,
    [SCREENS.REIMBURSEMENT_ACCOUNT]: () => require('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default as React.ComponentType,
    [SCREENS.GET_ASSISTANCE]: () => require('../../../../pages/GetAssistancePage').default as React.ComponentType,
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: () => require('../../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default as React.ComponentType,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: () => require('../../../../pages/settings/Wallet/ReportCardLostPage').default as React.ComponentType,
    [SCREENS.KEYBOARD_SHORTCUTS]: () => require('../../../../pages/KeyboardShortcutsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: () => require('../../../../pages/settings/ExitSurvey/ExitSurveyReasonPage').default as React.ComponentType,
    [SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE]: () => require('../../../../pages/settings/ExitSurvey/ExitSurveyResponsePage').default as React.ComponentType,
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: () => require('../../../../pages/settings/ExitSurvey/ExitSurveyConfirmPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: () => require('../../../../pages/workspace/accounting/qbo/import/QuickbooksImportPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: () =>
        require('../../../../pages/workspace/accounting/qbo/import/QuickbooksChartOfAccountsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: () => require('../../../../pages/workspace/accounting/qbo/import/QuickbooksCustomersPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: () => require('../../../../pages/workspace/accounting/qbo/import/QuickbooksTaxesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: () => require('../../../../pages/workspace/accounting/qbo/import/QuickbooksLocationsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: () => require('../../../../pages/workspace/accounting/qbo/import/QuickbooksClassesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: () => require('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAdvancedPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: () =>
        require('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAccountSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: () =>
        require('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksInvoiceAccountSelectPage').default as React.ComponentType,

    [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: () => require('../../../../pages/workspace/accounting/xero/XeroImportPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION]: () => require('../../../../pages/workspace/accounting/xero/XeroOrganizationConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS]: () => require('../../../../pages/workspace/accounting/xero/import/XeroChartOfAccountsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CUSTOMER]: () => require('../../../../pages/workspace/accounting/xero/import/XeroCustomerConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TAXES]: () => require('../../../../pages/workspace/accounting/xero/XeroTaxesConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES]: () =>
        require('../../../../pages/workspace/accounting/xero/XeroTrackingCategoryConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY]: () =>
        require('../../../../pages/workspace/accounting/xero/XeroMapTrackingCategoryConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT]: () => require('../../../../pages/workspace/accounting/xero/export/XeroExportConfigurationPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: () =>
        require('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillDateSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT]: () =>
        require('../../../../pages/workspace/accounting/xero/export/XeroBankAccountSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: () => require('../../../../pages/workspace/accounting/xero/advanced/XeroAdvancedPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: () =>
        require('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillStatusSelectorPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: () =>
        require('../../../../pages/workspace/accounting/xero/advanced/XeroInvoiceAccountSelectorPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: () =>
        require('../../../../pages/workspace/accounting/xero/export/XeroPreferredExporterSelectPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: () =>
        require('../../../../pages/workspace/accounting/xero/advanced/XeroBillPaymentAccountSelectorPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES]: () => require('../../../../pages/workspace/accounting/intacct/IntacctPrerequisitesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.ENTER_SAGE_INTACCT_CREDENTIALS]: () =>
        require('../../../../pages/workspace/accounting/intacct/EnterSageIntacctCredentialsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS]: () => require('../../../../pages/workspace/accounting/intacct/ExistingConnectionsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: () => require('../../../../pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: () =>
        require('../../../../pages/workspace/workflows/WorkspaceAutoReportingMonthlyOffsetPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_EDIT]: () => require('../../../../pages/workspace/taxes/WorkspaceEditTaxPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_NAME]: () => require('../../../../pages/workspace/taxes/NamePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_VALUE]: () => require('../../../../pages/workspace/taxes/ValuePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_CREATE]: () => require('../../../../pages/workspace/taxes/WorkspaceCreateTaxPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require('../../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD]: () => require('../../../../pages/settings/Subscription/PaymentCard/AddPaymentCard').default as React.ComponentType,
});

const EnablePaymentsStackNavigator = createModalStackNavigator<EnablePaymentsNavigatorParamList>({
    [SCREENS.ENABLE_PAYMENTS_ROOT]: () => require('../../../../pages/EnablePayments/EnablePaymentsPage').default as React.ComponentType,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator<AddPersonalBankAccountNavigatorParamList>({
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: () => require('../../../../pages/AddPersonalBankAccountPage').default as React.ComponentType,
});

const ReimbursementAccountModalStackNavigator = createModalStackNavigator<ReimbursementAccountNavigatorParamList>({
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: () => require('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default as React.ComponentType,
});

const WalletStatementStackNavigator = createModalStackNavigator<WalletStatementNavigatorParamList>({
    [SCREENS.WALLET_STATEMENT_ROOT]: () => require('../../../../pages/wallet/WalletStatementPage').default as React.ComponentType,
});

const FlagCommentStackNavigator = createModalStackNavigator<FlagCommentNavigatorParamList>({
    [SCREENS.FLAG_COMMENT_ROOT]: () => require('../../../../pages/FlagCommentPage').default as React.ComponentType,
});

const EditRequestStackNavigator = createModalStackNavigator<EditRequestNavigatorParamList>({
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: () => require('../../../../pages/EditReportFieldPage').default as React.ComponentType,
});

const PrivateNotesModalStackNavigator = createModalStackNavigator<PrivateNotesNavigatorParamList>({
    [SCREENS.PRIVATE_NOTES.LIST]: () => require('../../../../pages/PrivateNotes/PrivateNotesListPage').default as React.ComponentType,
    [SCREENS.PRIVATE_NOTES.EDIT]: () => require('../../../../pages/PrivateNotes/PrivateNotesEditPage').default as React.ComponentType,
});

const SignInModalStackNavigator = createModalStackNavigator<SignInNavigatorParamList>({
    [SCREENS.SIGN_IN_ROOT]: () => require('../../../../pages/signin/SignInModal').default as React.ComponentType,
});
const ReferralModalStackNavigator = createModalStackNavigator<ReferralDetailsNavigatorParamList>({
    [SCREENS.REFERRAL_DETAILS]: () => require('../../../../pages/ReferralDetailsPage').default as React.ComponentType,
});

const ProcessMoneyRequestHoldStackNavigator = createModalStackNavigator({
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: () => require('../../../../pages/ProcessMoneyRequestHoldPage').default as React.ComponentType,
});

const TransactionDuplicateStackNavigator = createModalStackNavigator<TransactionDuplicateNavigatorParamList>({
    [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: () => require('../../../../pages/TransactionDuplicate/Review').default as React.ComponentType,
});

const SearchReportModalStackNavigator = createModalStackNavigator<SearchReportParamList>({
    [SCREENS.SEARCH.REPORT_RHP]: () => require('../../../../pages/home/ReportScreen').default as React.ComponentType,
});

export {
    AddPersonalBankAccountModalStackNavigator,
    EditRequestStackNavigator,
    EnablePaymentsStackNavigator,
    FlagCommentStackNavigator,
    MoneyRequestModalStackNavigator,
    NewChatModalStackNavigator,
    NewTaskModalStackNavigator,
    NewTeachersUniteNavigator,
    PrivateNotesModalStackNavigator,
    ProcessMoneyRequestHoldStackNavigator,
    ProfileModalStackNavigator,
    ReferralModalStackNavigator,
    TravelModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    ReportDescriptionModalStackNavigator,
    ReportDetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    ReportSettingsModalStackNavigator,
    RoomInviteModalStackNavigator,
    RoomMembersModalStackNavigator,
    SettingsModalStackNavigator,
    SignInModalStackNavigator,
    CategoriesModalStackNavigator,
    SplitDetailsModalStackNavigator,
    TaskModalStackNavigator,
    WalletStatementStackNavigator,
    TransactionDuplicateStackNavigator,
    SearchReportModalStackNavigator,
};
