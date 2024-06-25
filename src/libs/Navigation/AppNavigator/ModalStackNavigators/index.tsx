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
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
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
    [SCREENS.MONEY_REQUEST.START]: () => require<ReactComponentModule>('../../../../pages/iou/request/IOURequestRedirectToStartPage').default,
    [SCREENS.MONEY_REQUEST.CREATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/IOURequestStartPage').default,
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepConfirmation').default,
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepAmount').default,
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTaxAmountPage').default,
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTaxRatePage').default,
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepCategory').default,
    [SCREENS.MONEY_REQUEST.STEP_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepCurrency').default,
    [SCREENS.MONEY_REQUEST.STEP_DATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDate').default,
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDescription').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDistance').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: () => require<ReactComponentModule>('@pages/iou/request/step/IOURequestStepDistanceRate').default,
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepMerchant').default,
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepParticipants').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepScan').default,
    [SCREENS.MONEY_REQUEST.STEP_TAG]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTag').default,
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepWaypoint').default,
    [SCREENS.MONEY_REQUEST.STEP_SPLIT_PAYER]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepSplitPayer').default,
    [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepSendFrom').default,
    [SCREENS.MONEY_REQUEST.HOLD]: () => require<ReactComponentModule>('../../../../pages/iou/HoldReasonPage').default,
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: () => require<ReactComponentModule>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
    [SCREENS.MONEY_REQUEST.STATE_SELECTOR]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default,
});

const TravelModalStackNavigator = createModalStackNavigator<TravelNavigatorParamList>({
    [SCREENS.TRAVEL.MY_TRIPS]: () => require<ReactComponentModule>('../../../../pages/Travel/MyTripsPage').default,
    [SCREENS.TRAVEL.TCS]: () => require<ReactComponentModule>('../../../../pages/Travel/TravelTerms').default,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator<SplitDetailsNavigatorParamList>({
    [SCREENS.SPLIT_DETAILS.ROOT]: () => require<ReactComponentModule>('../../../../pages/iou/SplitBillDetailsPage').default,
});

const ProfileModalStackNavigator = createModalStackNavigator<ProfileNavigatorParamList>({
    [SCREENS.PROFILE_ROOT]: () => require<ReactComponentModule>('../../../../pages/ProfilePage').default,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator<ReportDetailsNavigatorParamList>({
    [SCREENS.REPORT_DETAILS.ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportDetailsPage').default,
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: () => require<ReactComponentModule>('../../../../pages/home/report/ReportDetailsShareCodePage').default,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator<ReportSettingsNavigatorParamList>({
    [SCREENS.REPORT_SETTINGS.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Report/ReportSettingsPage').default,
    [SCREENS.REPORT_SETTINGS.NAME]: () => require<ReactComponentModule>('../../../../pages/settings/Report/NamePage').default,
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: () => require<ReactComponentModule>('../../../../pages/settings/Report/NotificationPreferencePage').default,
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: () => require<ReactComponentModule>('../../../../pages/settings/Report/WriteCapabilityPage').default,
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: () => require<ReactComponentModule>('../../../../pages/settings/Report/VisibilityPage').default,
});

const TaskModalStackNavigator = createModalStackNavigator<TaskDetailsNavigatorParamList>({
    [SCREENS.TASK.TITLE]: () => require<ReactComponentModule>('../../../../pages/tasks/TaskTitlePage').default,
    [SCREENS.TASK.ASSIGNEE]: () => require<ReactComponentModule>('../../../../pages/tasks/TaskAssigneeSelectorModal').default,
});

const ReportDescriptionModalStackNavigator = createModalStackNavigator<ReportDescriptionNavigatorParamList>({
    [SCREENS.REPORT_DESCRIPTION_ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportDescriptionPage').default,
});

const CategoriesModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CreateCategoryPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/EditCategoryPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategorySettingsPage').default,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator<ParticipantsNavigatorParamList>({
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportParticipantsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: () => require<ReactComponentModule>('../../../../pages/InviteReportParticipantsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: () => require<ReactComponentModule>('../../../../pages/ReportParticipantDetailsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: () => require<ReactComponentModule>('../../../../pages/ReportParticipantRoleSelectionPage').default,
});

const RoomMembersModalStackNavigator = createModalStackNavigator<RoomMembersNavigatorParamList>({
    [SCREENS.ROOM_MEMBERS_ROOT]: () => require<ReactComponentModule>('../../../../pages/RoomMembersPage').default,
});

const RoomInviteModalStackNavigator = createModalStackNavigator<RoomInviteNavigatorParamList>({
    [SCREENS.ROOM_INVITE_ROOT]: () => require<ReactComponentModule>('../../../../pages/RoomInvitePage').default,
});

const NewChatModalStackNavigator = createModalStackNavigator<NewChatNavigatorParamList>({
    [SCREENS.NEW_CHAT.ROOT]: () => require<ReactComponentModule>('../../../../pages/NewChatSelectorPage').default,
    [SCREENS.NEW_CHAT.NEW_CHAT_CONFIRM]: () => require<ReactComponentModule>('../../../../pages/NewChatConfirmPage').default,
    [SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME]: () => require<ReactComponentModule>('../../../../pages/GroupChatNameEditPage').default,
});

const NewTaskModalStackNavigator = createModalStackNavigator<NewTaskNavigatorParamList>({
    [SCREENS.NEW_TASK.ROOT]: () => require<ReactComponentModule>('../../../../pages/tasks/NewTaskPage').default,
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: () => require<ReactComponentModule>('../../../../pages/tasks/TaskAssigneeSelectorModal').default,
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: () => require<ReactComponentModule>('../../../../pages/tasks/TaskShareDestinationSelectorModal').default,
    [SCREENS.NEW_TASK.DETAILS]: () => require<ReactComponentModule>('../../../../pages/tasks/NewTaskDetailsPage').default,
    [SCREENS.NEW_TASK.TITLE]: () => require<ReactComponentModule>('../../../../pages/tasks/NewTaskTitlePage').default,
    [SCREENS.NEW_TASK.DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/tasks/NewTaskDescriptionPage').default,
});

const NewTeachersUniteNavigator = createModalStackNavigator<TeachersUniteNavigatorParamList>({
    [SCREENS.SAVE_THE_WORLD.ROOT]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.I_KNOW_A_TEACHER]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/KnowATeacherPage').default,
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/ImTeacherPage').default,
    [SCREENS.I_AM_A_TEACHER]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/ImTeacherPage').default,
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
    [SCREENS.SETTINGS.ADD_PAYMENT_CARD_CHANGE_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/PaymentCard/ChangeCurrency').default as React.ComponentType,
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
        require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateTaxReclaimableEditPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateTaxRateEditPage').default,
    [SCREENS.WORKSPACE.TAGS_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsSettingsPage').default,
    [SCREENS.WORKSPACE.TAG_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagSettingsPage').default,
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceViewTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceEditTagsPage').default,
    [SCREENS.WORKSPACE.TAG_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceCreateTagPage').default,
    [SCREENS.WORKSPACE.TAG_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/EditTagPage').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsPage').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsCustomTaxName').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsForeignCurrency').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsWorkspaceCurrency').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportDateSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportInvoiceAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseEntitySelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksNonReimbursableDefaultVendorSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('@pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountSelectCardPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksPreferredExporterConfigurationPage').default,
    [SCREENS.REIMBURSEMENT_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
    [SCREENS.GET_ASSISTANCE]: () => require<ReactComponentModule>('../../../../pages/GetAssistancePage').default,
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportCardLostPage').default,
    [SCREENS.KEYBOARD_SHORTCUTS]: () => require<ReactComponentModule>('../../../../pages/KeyboardShortcutsPage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: () => require<ReactComponentModule>('../../../../pages/settings/ExitSurvey/ExitSurveyReasonPage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE]: () => require<ReactComponentModule>('../../../../pages/settings/ExitSurvey/ExitSurveyResponsePage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: () => require<ReactComponentModule>('../../../../pages/settings/ExitSurvey/ExitSurveyConfirmPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksChartOfAccountsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksCustomersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksTaxesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksLocationsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksClassesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksInvoiceAccountSelectPage').default,

    [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/XeroImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/XeroOrganizationConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/import/XeroChartOfAccountsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CUSTOMER]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/import/XeroCustomerConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TAXES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/XeroTaxesConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/XeroTrackingCategoryConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/XeroMapTrackingCategoryConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroExportConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillDateSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroBankAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/advanced/XeroAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillStatusSelectorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/advanced/XeroInvoiceAccountSelectorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroPreferredExporterSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: () =>
        require('../../../../pages/workspace/accounting/xero/advanced/XeroBillPaymentAccountSelectorPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: () => require('../../../../pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: () =>
        require('../../../../pages/workspace/workflows/WorkspaceAutoReportingMonthlyOffsetPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_EDIT]: () => require('../../../../pages/workspace/taxes/WorkspaceEditTaxPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_NAME]: () => require('../../../../pages/workspace/taxes/NamePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_VALUE]: () => require('../../../../pages/workspace/taxes/ValuePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAX_CREATE]: () => require('../../../../pages/workspace/taxes/WorkspaceCreateTaxPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require('../../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/PaymentCard/ChangeCurrency').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/PaymentCard/ChangeBillingCurrency').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/PaymentCard/AddPaymentCard').default as React.ComponentType,
});

const EnablePaymentsStackNavigator = createModalStackNavigator<EnablePaymentsNavigatorParamList>({
    [SCREENS.ENABLE_PAYMENTS_ROOT]: () => require<ReactComponentModule>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator<AddPersonalBankAccountNavigatorParamList>({
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: () => require<ReactComponentModule>('../../../../pages/AddPersonalBankAccountPage').default,
});

const ReimbursementAccountModalStackNavigator = createModalStackNavigator<ReimbursementAccountNavigatorParamList>({
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: () => require<ReactComponentModule>('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
});

const WalletStatementStackNavigator = createModalStackNavigator<WalletStatementNavigatorParamList>({
    [SCREENS.WALLET_STATEMENT_ROOT]: () => require<ReactComponentModule>('../../../../pages/wallet/WalletStatementPage').default,
});

const FlagCommentStackNavigator = createModalStackNavigator<FlagCommentNavigatorParamList>({
    [SCREENS.FLAG_COMMENT_ROOT]: () => require<ReactComponentModule>('../../../../pages/FlagCommentPage').default,
});

const EditRequestStackNavigator = createModalStackNavigator<EditRequestNavigatorParamList>({
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: () => require<ReactComponentModule>('../../../../pages/EditReportFieldPage').default,
});

const PrivateNotesModalStackNavigator = createModalStackNavigator<PrivateNotesNavigatorParamList>({
    [SCREENS.PRIVATE_NOTES.LIST]: () => require<ReactComponentModule>('../../../../pages/PrivateNotes/PrivateNotesListPage').default,
    [SCREENS.PRIVATE_NOTES.EDIT]: () => require<ReactComponentModule>('../../../../pages/PrivateNotes/PrivateNotesEditPage').default,
});

const SignInModalStackNavigator = createModalStackNavigator<SignInNavigatorParamList>({
    [SCREENS.SIGN_IN_ROOT]: () => require<ReactComponentModule>('../../../../pages/signin/SignInModal').default,
});
const ReferralModalStackNavigator = createModalStackNavigator<ReferralDetailsNavigatorParamList>({
    [SCREENS.REFERRAL_DETAILS]: () => require<ReactComponentModule>('../../../../pages/ReferralDetailsPage').default,
});

const ProcessMoneyRequestHoldStackNavigator = createModalStackNavigator({
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: () => require<ReactComponentModule>('../../../../pages/ProcessMoneyRequestHoldPage').default,
});

const TransactionDuplicateStackNavigator = createModalStackNavigator<TransactionDuplicateNavigatorParamList>({
    [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/Review').default,
});

const SearchReportModalStackNavigator = createModalStackNavigator<SearchReportParamList>({
    [SCREENS.SEARCH.REPORT_RHP]: () => require<ReactComponentModule>('../../../../pages/home/ReportScreen').default,
});

const RestrictedActionModalStackNavigator = createModalStackNavigator<SearchReportParamList>({
    [SCREENS.RESTRICTED_ACTION_ROOT]: () => require<ReactComponentModule>('../../../../pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage').default,
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
    RestrictedActionModalStackNavigator,
};
