import type {ParamListBase} from '@react-navigation/routers';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
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
    TravelNavigatorParamList,
    WalletStatementNavigatorParamList,
} from '@navigation/types';
import type {ThemeStyles} from '@styles/index';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import type RequireReactComponent from '@src/types/utils/RequireReactComponent';
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
    [SCREENS.MONEY_REQUEST.START]: () => require<RequireReactComponent>('../../../../pages/iou/request/IOURequestRedirectToStartPage').default,
    [SCREENS.MONEY_REQUEST.CREATE]: () => require<RequireReactComponent>('../../../../pages/iou/request/IOURequestStartPage').default,
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepConfirmation').default,
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepAmount').default,
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepTaxAmountPage').default,
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepTaxRatePage').default,
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepCategory').default,
    [SCREENS.MONEY_REQUEST.STEP_CURRENCY]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepCurrency').default,
    [SCREENS.MONEY_REQUEST.STEP_DATE]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepDate').default,
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepDescription').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepDistance').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: () => require<RequireReactComponent>('@pages/iou/request/step/IOURequestStepDistanceRate').default,
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepMerchant').default,
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepParticipants').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepScan').default,
    [SCREENS.MONEY_REQUEST.STEP_TAG]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepTag').default,
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepWaypoint').default,
    [SCREENS.MONEY_REQUEST.STEP_SPLIT_PAYER]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepSplitPayer').default,
    [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: () => require<RequireReactComponent>('../../../../pages/iou/request/step/IOURequestStepSendFrom').default,
    [SCREENS.MONEY_REQUEST.HOLD]: () => require<RequireReactComponent>('../../../../pages/iou/HoldReasonPage').default,
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: () => require<RequireReactComponent>('../../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: () => require<RequireReactComponent>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
    [SCREENS.MONEY_REQUEST.STATE_SELECTOR]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default,
});

const TravelModalStackNavigator = createModalStackNavigator<TravelNavigatorParamList>({
    [SCREENS.TRAVEL.MY_TRIPS]: () => require<RequireReactComponent>('../../../../pages/Travel/MyTripsPage').default,
    [SCREENS.TRAVEL.TCS]: () => require<RequireReactComponent>('../../../../pages/Travel/TravelTerms').default,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator<SplitDetailsNavigatorParamList>({
    [SCREENS.SPLIT_DETAILS.ROOT]: () => require<RequireReactComponent>('../../../../pages/iou/SplitBillDetailsPage').default,
});

const DetailsModalStackNavigator = createModalStackNavigator<DetailsNavigatorParamList>({
    [SCREENS.DETAILS_ROOT]: () => require<RequireReactComponent>('../../../../pages/DetailsPage').default,
});

const ProfileModalStackNavigator = createModalStackNavigator<ProfileNavigatorParamList>({
    [SCREENS.PROFILE_ROOT]: () => require<RequireReactComponent>('../../../../pages/ProfilePage').default,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator<ReportDetailsNavigatorParamList>({
    [SCREENS.REPORT_DETAILS.ROOT]: () => require<RequireReactComponent>('../../../../pages/ReportDetailsPage').default,
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: () => require<RequireReactComponent>('../../../../pages/home/report/ReportDetailsShareCodePage').default,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator<ReportSettingsNavigatorParamList>({
    [SCREENS.REPORT_SETTINGS.ROOT]: () => require<RequireReactComponent>('../../../../pages/settings/Report/ReportSettingsPage').default,
    [SCREENS.REPORT_SETTINGS.NAME]: () => require<RequireReactComponent>('../../../../pages/settings/Report/NamePage').default,
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: () => require<RequireReactComponent>('../../../../pages/settings/Report/NotificationPreferencePage').default,
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: () => require<RequireReactComponent>('../../../../pages/settings/Report/WriteCapabilityPage').default,
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: () => require<RequireReactComponent>('../../../../pages/settings/Report/VisibilityPage').default,
});

const TaskModalStackNavigator = createModalStackNavigator<TaskDetailsNavigatorParamList>({
    [SCREENS.TASK.TITLE]: () => require<RequireReactComponent>('../../../../pages/tasks/TaskTitlePage').default,
    [SCREENS.TASK.ASSIGNEE]: () => require<RequireReactComponent>('../../../../pages/tasks/TaskAssigneeSelectorModal').default,
});

const ReportDescriptionModalStackNavigator = createModalStackNavigator<ReportDescriptionNavigatorParamList>({
    [SCREENS.REPORT_DESCRIPTION_ROOT]: () => require<RequireReactComponent>('../../../../pages/ReportDescriptionPage').default,
});

const CategoriesModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/CreateCategoryPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/EditCategoryPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/CategorySettingsPage').default,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator<ParticipantsNavigatorParamList>({
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: () => require<RequireReactComponent>('../../../../pages/ReportParticipantsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: () => require<RequireReactComponent>('../../../../pages/InviteReportParticipantsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: () => require<RequireReactComponent>('../../../../pages/ReportParticipantDetailsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: () => require<RequireReactComponent>('../../../../pages/ReportParticipantRoleSelectionPage').default,
});

const RoomMembersModalStackNavigator = createModalStackNavigator<RoomMembersNavigatorParamList>({
    [SCREENS.ROOM_MEMBERS_ROOT]: () => require<RequireReactComponent>('../../../../pages/RoomMembersPage').default,
});

const RoomInviteModalStackNavigator = createModalStackNavigator<RoomInviteNavigatorParamList>({
    [SCREENS.ROOM_INVITE_ROOT]: () => require<RequireReactComponent>('../../../../pages/RoomInvitePage').default,
});

const NewChatModalStackNavigator = createModalStackNavigator<NewChatNavigatorParamList>({
    [SCREENS.NEW_CHAT.ROOT]: () => require<RequireReactComponent>('../../../../pages/NewChatSelectorPage').default,
    [SCREENS.NEW_CHAT.NEW_CHAT_CONFIRM]: () => require<RequireReactComponent>('../../../../pages/NewChatConfirmPage').default,
    [SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME]: () => require<RequireReactComponent>('../../../../pages/GroupChatNameEditPage').default,
});

const NewTaskModalStackNavigator = createModalStackNavigator<NewTaskNavigatorParamList>({
    [SCREENS.NEW_TASK.ROOT]: () => require<RequireReactComponent>('../../../../pages/tasks/NewTaskPage').default,
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: () => require<RequireReactComponent>('../../../../pages/tasks/TaskAssigneeSelectorModal').default,
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: () => require<RequireReactComponent>('../../../../pages/tasks/TaskShareDestinationSelectorModal').default,
    [SCREENS.NEW_TASK.DETAILS]: () => require<RequireReactComponent>('../../../../pages/tasks/NewTaskDetailsPage').default,
    [SCREENS.NEW_TASK.TITLE]: () => require<RequireReactComponent>('../../../../pages/tasks/NewTaskTitlePage').default,
    [SCREENS.NEW_TASK.DESCRIPTION]: () => require<RequireReactComponent>('../../../../pages/tasks/NewTaskDescriptionPage').default,
});

const NewTeachersUniteNavigator = createModalStackNavigator<TeachersUniteNavigatorParamList>({
    [SCREENS.SAVE_THE_WORLD.ROOT]: () => require<RequireReactComponent>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.I_KNOW_A_TEACHER]: () => require<RequireReactComponent>('../../../../pages/TeachersUnite/KnowATeacherPage').default,
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: () => require<RequireReactComponent>('../../../../pages/TeachersUnite/ImTeacherPage').default,
    [SCREENS.I_AM_A_TEACHER]: () => require<RequireReactComponent>('../../../../pages/TeachersUnite/ImTeacherPage').default,
});

const SettingsModalStackNavigator = createModalStackNavigator<SettingsNavigatorParamList>({
    [SCREENS.SETTINGS.SHARE_CODE]: () => require<RequireReactComponent>('../../../../pages/ShareCodePage').default,
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PronounsPage').default,
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/DisplayNamePage').default,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/TimezoneInitialPage').default,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/TimezoneSelectPage').default,
    [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default,
    [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default,
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/AddressPage').default,
    [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/CountrySelectionPage').default,
    [SCREENS.SETTINGS.PROFILE.ADDRESS_STATE]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/Contacts/ContactMethodsPage').default,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default,
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/Contacts/NewContactMethodPage').default,
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: () => require<RequireReactComponent>('../../../../pages/settings/Preferences/PriorityModePage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/PolicyAccountingPage').default,
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: () => require<RequireReactComponent>('../../../../pages/settings/Preferences/LanguagePage').default,
    [SCREENS.SETTINGS.PREFERENCES.THEME]: () => require<RequireReactComponent>('../../../../pages/settings/Preferences/ThemePage').default,
    [SCREENS.SETTINGS.CLOSE]: () => require<RequireReactComponent>('../../../../pages/settings/Security/CloseAccountPage').default,
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: () => require<RequireReactComponent>('../../../../pages/settings/AppDownloadLinks').default,
    [SCREENS.SETTINGS.CONSOLE]: () => require<RequireReactComponent>('../../../../pages/settings/AboutPage/ConsolePage').default,
    [SCREENS.SETTINGS.SHARE_LOG]: () => require<RequireReactComponent>('../../../../pages/settings/AboutPage/ShareLogPage').default,
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/PersonalDetails/AddressPage').default,
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/ExpensifyCardPage').default,
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/ReportVirtualCardFraudPage').default,
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/ActivatePhysicalCardPage').default,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/Card/GetPhysicalCardName').default,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/Card/GetPhysicalCardPhone').default,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/Card/GetPhysicalCardAddress').default,
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/Card/GetPhysicalCardConfirm').default,
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/TransferBalancePage').default,
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/ChooseTransferAccountPage').default,
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: () => require<RequireReactComponent>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
    // TODO: Added temporarily for testing purposes, remove after refactor - https://github.com/Expensify/App/issues/36648
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS_REFACTOR]: () => require<RequireReactComponent>('../../../../pages/EnablePayments/PersonalInfo/PersonalInfo').default,
    // TODO: Added temporarily for testing purposes, remove after refactor - https://github.com/Expensify/App/issues/36648
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS_TEMPORARY_TERMS]: () => require<RequireReactComponent>('../../../../pages/EnablePayments/FeesAndTerms/FeesAndTerms').default,
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: () => require<RequireReactComponent>('../../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_REFACTOR]: () => require<RequireReactComponent>('../../../../pages/EnablePayments/AddBankAccount/AddBankAccount').default,
    [SCREENS.SETTINGS.PROFILE.STATUS]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/CustomStatus/StatusPage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/CustomStatus/StatusClearAfterPage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/CustomStatus/SetDatePage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: () => require<RequireReactComponent>('../../../../pages/settings/Profile/CustomStatus/SetTimePage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: () => require<RequireReactComponent>('../../../../pages/settings/Subscription/SubscriptionSize/SubscriptionSizePage').default,
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: () => require<RequireReactComponent>('../../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage/InitialPage').default,
    [SCREENS.WORKSPACE.RATE_AND_UNIT_RATE]: () => require<RequireReactComponent>('../../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage/RatePage').default,
    [SCREENS.WORKSPACE.RATE_AND_UNIT_UNIT]: () => require<RequireReactComponent>('../../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage/UnitPage').default,
    [SCREENS.WORKSPACE.INVITE]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceInvitePage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVER]: () => require<RequireReactComponent>('../../../../pages/workspace/workflows/WorkspaceWorkflowsApproverPage').default,
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceInviteMessagePage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: () => require<RequireReactComponent>('../../../../pages/workspace/workflows/WorkspaceWorkflowsPayerPage').default,
    [SCREENS.WORKSPACE.NAME]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceNamePage').default,
    [SCREENS.WORKSPACE.DESCRIPTION]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceProfileDescriptionPage').default,
    [SCREENS.WORKSPACE.SHARE]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceProfileSharePage').default,
    [SCREENS.WORKSPACE.CURRENCY]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceProfileCurrencyPage').default,
    [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/CategorySettingsPage').default,
    [SCREENS.WORKSPACE.ADDRESS]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceProfileAddressPage').default,
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default,
    [SCREENS.WORKSPACE.MEMBER_DETAILS]: () => require<RequireReactComponent>('../../../../pages/workspace/members/WorkspaceMemberDetailsPage').default,
    [SCREENS.WORKSPACE.OWNER_CHANGE_CHECK]: () => require<RequireReactComponent>('@pages/workspace/members/WorkspaceOwnerChangeWrapperPage').default,
    [SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS]: () => require<RequireReactComponent>('../../../../pages/workspace/members/WorkspaceOwnerChangeSuccessPage').default,
    [SCREENS.WORKSPACE.OWNER_CHANGE_ERROR]: () => require<RequireReactComponent>('../../../../pages/workspace/members/WorkspaceOwnerChangeErrorPage').default,
    [SCREENS.WORKSPACE.CATEGORY_CREATE]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/CreateCategoryPage').default,
    [SCREENS.WORKSPACE.CATEGORY_EDIT]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/EditCategoryPage').default,
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: () => require<RequireReactComponent>('../../../../pages/workspace/distanceRates/CreateDistanceRatePage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/distanceRates/PolicyDistanceRatesSettingsPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS]: () => require<RequireReactComponent>('../../../../pages/workspace/distanceRates/PolicyDistanceRateDetailsPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_EDIT]: () => require<RequireReactComponent>('../../../../pages/workspace/distanceRates/PolicyDistanceRateEditPage').default,
    [SCREENS.WORKSPACE.TAGS_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/WorkspaceTagsSettingsPage').default,
    [SCREENS.WORKSPACE.TAG_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/TagSettingsPage').default,
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/WorkspaceViewTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_EDIT]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/WorkspaceEditTagsPage').default,
    [SCREENS.WORKSPACE.TAG_CREATE]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/WorkspaceCreateTagPage').default,
    [SCREENS.WORKSPACE.TAG_EDIT]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/EditTagPage').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsPage').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsCustomTaxName').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsForeignCurrency').default,
    [SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceTaxesSettingsWorkspaceCurrency').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportDateSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksExportInvoiceAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksOutOfPocketExpenseEntitySelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksNonReimbursableDefaultVendorSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: () =>
        require<RequireReactComponent>('@pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountSelectCardPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/export/QuickbooksPreferredExporterConfigurationPage').default,
    [SCREENS.REIMBURSEMENT_ACCOUNT]: () => require<RequireReactComponent>('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
    [SCREENS.GET_ASSISTANCE]: () => require<RequireReactComponent>('../../../../pages/GetAssistancePage').default,
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: () => require<RequireReactComponent>('../../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: () => require<RequireReactComponent>('../../../../pages/settings/Wallet/ReportCardLostPage').default,
    [SCREENS.KEYBOARD_SHORTCUTS]: () => require<RequireReactComponent>('../../../../pages/KeyboardShortcutsPage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: () => require<RequireReactComponent>('../../../../pages/settings/ExitSurvey/ExitSurveyReasonPage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE]: () => require<RequireReactComponent>('../../../../pages/settings/ExitSurvey/ExitSurveyResponsePage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: () => require<RequireReactComponent>('../../../../pages/settings/ExitSurvey/ExitSurveyConfirmPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/import/QuickbooksImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/import/QuickbooksChartOfAccountsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/import/QuickbooksCustomersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/import/QuickbooksTaxesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/import/QuickbooksLocationsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/import/QuickbooksClassesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksInvoiceAccountSelectPage').default,

    [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/XeroImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/XeroOrganizationConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/import/XeroChartOfAccountsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CUSTOMER]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/import/XeroCustomerConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TAXES]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/XeroTaxesConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/XeroTrackingCategoryConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/XeroMapTrackingCategoryConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/export/XeroExportConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillDateSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/export/XeroBankAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/advanced/XeroAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillStatusSelectorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/advanced/XeroInvoiceAccountSelectorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/export/XeroPreferredExporterSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/accounting/xero/advanced/XeroBillPaymentAccountSelectorPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: () => require<RequireReactComponent>('../../../../pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: () =>
        require<RequireReactComponent>('../../../../pages/workspace/workflows/WorkspaceAutoReportingMonthlyOffsetPage').default,
    [SCREENS.WORKSPACE.TAX_EDIT]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceEditTaxPage').default,
    [SCREENS.WORKSPACE.TAX_NAME]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/NamePage').default,
    [SCREENS.WORKSPACE.TAX_VALUE]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/ValuePage').default,
    [SCREENS.WORKSPACE.TAX_CREATE]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceCreateTaxPage').default,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require<RequireReactComponent>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
});

const EnablePaymentsStackNavigator = createModalStackNavigator<EnablePaymentsNavigatorParamList>({
    [SCREENS.ENABLE_PAYMENTS_ROOT]: () => require<RequireReactComponent>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator<AddPersonalBankAccountNavigatorParamList>({
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: () => require<RequireReactComponent>('../../../../pages/AddPersonalBankAccountPage').default,
});

const ReimbursementAccountModalStackNavigator = createModalStackNavigator<ReimbursementAccountNavigatorParamList>({
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: () => require<RequireReactComponent>('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
});

const WalletStatementStackNavigator = createModalStackNavigator<WalletStatementNavigatorParamList>({
    [SCREENS.WALLET_STATEMENT_ROOT]: () => require<RequireReactComponent>('../../../../pages/wallet/WalletStatementPage').default,
});

const FlagCommentStackNavigator = createModalStackNavigator<FlagCommentNavigatorParamList>({
    [SCREENS.FLAG_COMMENT_ROOT]: () => require<RequireReactComponent>('../../../../pages/FlagCommentPage').default,
});

const EditRequestStackNavigator = createModalStackNavigator<EditRequestNavigatorParamList>({
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: () => require<RequireReactComponent>('../../../../pages/EditReportFieldPage').default,
});

const PrivateNotesModalStackNavigator = createModalStackNavigator<PrivateNotesNavigatorParamList>({
    [SCREENS.PRIVATE_NOTES.LIST]: () => require<RequireReactComponent>('../../../../pages/PrivateNotes/PrivateNotesListPage').default,
    [SCREENS.PRIVATE_NOTES.EDIT]: () => require<RequireReactComponent>('../../../../pages/PrivateNotes/PrivateNotesEditPage').default,
});

const SignInModalStackNavigator = createModalStackNavigator<SignInNavigatorParamList>({
    [SCREENS.SIGN_IN_ROOT]: () => require<RequireReactComponent>('../../../../pages/signin/SignInModal').default,
});
const ReferralModalStackNavigator = createModalStackNavigator<ReferralDetailsNavigatorParamList>({
    [SCREENS.REFERRAL_DETAILS]: () => require<RequireReactComponent>('../../../../pages/ReferralDetailsPage').default,
});

const ProcessMoneyRequestHoldStackNavigator = createModalStackNavigator({
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: () => require<RequireReactComponent>('../../../../pages/ProcessMoneyRequestHoldPage').default,
});

const SearchReportModalStackNavigator = createModalStackNavigator<SearchReportParamList>({
    [SCREENS.SEARCH.REPORT_RHP]: () => require<RequireReactComponent>('../../../../pages/home/ReportScreen').default,
});

export {
    AddPersonalBankAccountModalStackNavigator,
    DetailsModalStackNavigator,
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
    SearchReportModalStackNavigator,
};
