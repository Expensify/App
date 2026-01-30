import type {ParamListBase} from '@react-navigation/routers';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {
    AddPersonalBankAccountNavigatorParamList,
    AddUnreportedExpensesParamList,
    ConsoleNavigatorParamList,
    DebugParamList,
    EditRequestNavigatorParamList,
    EnablePaymentsNavigatorParamList,
    FlagCommentNavigatorParamList,
    MergeTransactionNavigatorParamList,
    MissingPersonalDetailsParamList,
    MoneyRequestNavigatorParamList,
    MultifactorAuthenticationParamList,
    NewChatNavigatorParamList,
    NewReportWorkspaceSelectionNavigatorParamList,
    NewTaskNavigatorParamList,
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ProfileNavigatorParamList,
    ReferralDetailsNavigatorParamList,
    ReportCardActivateNavigatorParamList,
    ReportChangeApproverParamList,
    ReportChangeWorkspaceNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    ReportVerifyAccountNavigatorParamList,
    RestrictedActionParamList,
    RoomMembersNavigatorParamList,
    ScheduleCallParamList,
    SearchAdvancedFiltersParamList,
    SearchColumnsParamList,
    SearchReportActionsParamList,
    SearchSavedSearchParamList,
    SettingsNavigatorParamList,
    ShareNavigatorParamList,
    SignInNavigatorParamList,
    SplitDetailsNavigatorParamList,
    TaskDetailsNavigatorParamList,
    TeachersUniteNavigatorParamList,
    TransactionDuplicateNavigatorParamList,
    TravelNavigatorParamList,
    WalletStatementNavigatorParamList,
    WorkspaceConfirmationNavigatorParamList,
    WorkspaceDuplicateNavigatorParamList,
    WorkspacesDomainModalNavigatorParamList,
} from '@navigation/types';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import useModalStackScreenOptions from './useModalStackScreenOptions';

const loadAttachmentModalScreen = () => require<ReactComponentModule>('../../../../pages/media/AttachmentModalScreen').default;

type Screens = Partial<Record<Screen, () => React.ComponentType>>;

const OPTIONS_PER_SCREEN: Partial<Record<Screen, PlatformStackNavigationOptions>> = {
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT]: {
        animationTypeForReplace: 'push',
    },
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS]: {
        animation: Animations.NONE,
    },
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS]: {
        animation: Animations.NONE,
    },
    [SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP]: {
        animation: Animations.NONE,
    },
    [SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP]: {
        animation: Animations.NONE,
    },
    [SCREENS.SEARCH.TRANSACTIONS_CHANGE_REPORT_SEARCH_RHP]: {
        animation: Animations.NONE,
    },
    [SCREENS.TRAVEL.VERIFY_ACCOUNT]: {
        animationTypeForReplace: 'push',
    },
    [SCREENS.TRAVEL.WORKSPACE_ADDRESS]: {
        animationTypeForReplace: 'push',
    },
};

/**
 * Create a modal stack navigator with an array of sub-screens.
 *
 * @param screens key/value pairs where the key is the name of the screen and the value is a function that returns the lazy-loaded component
 */
function createModalStackNavigator<ParamList extends ParamListBase>(screens: Screens): React.ComponentType {
    const ModalStackNavigator = createPlatformStackNavigator<ParamList>();

    function ModalStack() {
        const styles = useThemeStyles();
        const screenOptions = useModalStackScreenOptions();

        // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
        // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
        const {isSmallScreenWidth} = useResponsiveLayout();

        const getScreenOptions = useCallback<typeof screenOptions>(
            ({route: optionRoute}) => {
                // Extend common options if they are defined for the screen.
                if (OPTIONS_PER_SCREEN[optionRoute.name as Screen]) {
                    return {...screenOptions({route: optionRoute}), ...OPTIONS_PER_SCREEN[optionRoute.name as Screen]};
                }
                return screenOptions({route: optionRoute});
            },
            [screenOptions],
        );

        return (
            // This container is necessary to hide card translation during transition. Without it the user would see un-clipped cards.
            <View style={[styles.modalStackNavigatorContainer, styles.modalStackNavigatorContainerWidth(isSmallScreenWidth)]}>
                <ModalStackNavigator.Navigator>
                    {Object.keys(screens as Required<Screens>).map((name) => (
                        <ModalStackNavigator.Screen
                            key={name}
                            name={name}
                            getComponent={(screens as Required<Screens>)[name as Screen]}
                            // For some reason, screenOptions is not working with function as options so we have to pass it to every screen.
                            options={getScreenOptions}
                        />
                    ))}
                </ModalStackNavigator.Navigator>
            </View>
        );
    }

    return ModalStack;
}

const MoneyRequestModalStackNavigator = createModalStackNavigator<MoneyRequestNavigatorParamList>({
    [SCREENS.MONEY_REQUEST.START]: () => require<ReactComponentModule>('../../../../pages/iou/request/IOURequestRedirectToStartPage').default,
    [SCREENS.MONEY_REQUEST.CREATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/IOURequestStartPage').default,
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepConfirmation').default,
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/MoneyRequestStepConfirmationVerifyAccountPage').default,
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepAmount').default,
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTaxAmountPage').default,
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTaxRatePage').default,
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepCategory').default,
    [SCREENS.MONEY_REQUEST.STEP_DATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDate').default,
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDescription').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDistance').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: () => require<ReactComponentModule>('@pages/iou/request/step/IOURequestStepDistanceRate').default,
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepMerchant').default,
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepParticipants').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsPage').default,
    [SCREENS.MONEY_REQUEST.EDIT_REPORT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestEditReport').default,
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepScan').default,
    [SCREENS.MONEY_REQUEST.STEP_TAG]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTag').default,
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepWaypoint').default,
    [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepSendFrom').default,
    [SCREENS.MONEY_REQUEST.STEP_REPORT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepReport').default,
    [SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepCompanyInfo').default,
    [SCREENS.MONEY_REQUEST.HOLD]: () => require<ReactComponentModule>('../../../../pages/iou/HoldReasonPage').default,
    [SCREENS.MONEY_REQUEST.REJECT]: () => require<ReactComponentModule>('../../../../pages/iou/RejectReasonPage').default,
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: () => require<ReactComponentModule>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
    [SCREENS.MONEY_REQUEST.STATE_SELECTOR]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default,
    [SCREENS.MONEY_REQUEST.STEP_ATTENDEES]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepAttendees').default,
    [SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepAccountant').default,
    [SCREENS.MONEY_REQUEST.STEP_UPGRADE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepUpgrade').default,
    [SCREENS.MONEY_REQUEST.STEP_DESTINATION]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDestination').default,
    [SCREENS.MONEY_REQUEST.STEP_TIME]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTime').default,
    [SCREENS.MONEY_REQUEST.STEP_SUBRATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepSubrate').default,
    [SCREENS.MONEY_REQUEST.STEP_DESTINATION_EDIT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDestination').default,
    [SCREENS.MONEY_REQUEST.STEP_TIME_EDIT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTime').default,
    [SCREENS.MONEY_REQUEST.STEP_SUBRATE_EDIT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepSubrate').default,
    [SCREENS.MONEY_REQUEST.RECEIPT_VIEW]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepScan/ReceiptView').default,
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE]: () => require<ReactComponentModule>('../../../../pages/iou/SplitExpensePage').default,
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_SEARCH]: () => require<ReactComponentModule>('../../../../pages/iou/SplitExpensePage').default,
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_CREATE_DATE_RANGE]: () => require<ReactComponentModule>('../../../../pages/iou/SplitExpenseCreateDateRagePage').default,
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_EDIT]: () => require<ReactComponentModule>('../../../../pages/iou/SplitExpenseEditPage').default,
    [SCREENS.MONEY_REQUEST.DISTANCE_CREATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/DistanceRequestStartPage').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDistanceMap').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDistanceManual').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_GPS]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDistanceGPS').default,
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepDistanceOdometer').default,
    [SCREENS.MONEY_REQUEST.ODOMETER_IMAGE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepOdometerImage').default,
    [SCREENS.SET_DEFAULT_WORKSPACE]: () => require<ReactComponentModule>('../../../../pages/SetDefaultWorkspacePage').default,
    [SCREENS.MONEY_REQUEST.STEP_TIME_RATE]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepTimeRate').default,
    [SCREENS.MONEY_REQUEST.STEP_HOURS]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepHours').default,
    [SCREENS.MONEY_REQUEST.STEP_HOURS_EDIT]: () => require<ReactComponentModule>('../../../../pages/iou/request/step/IOURequestStepHours').default,
});

const TravelModalStackNavigator = createModalStackNavigator<TravelNavigatorParamList>({
    [SCREENS.TRAVEL.MY_TRIPS]: () => require<ReactComponentModule>('../../../../pages/Travel/MyTripsPage').default,
    [SCREENS.TRAVEL.TRAVEL_DOT_LINK_WEB_VIEW]: () => require<ReactComponentModule>('../../../../pages/Travel/TravelDotLinkWebview').default,
    [SCREENS.TRAVEL.TCS]: () => require<ReactComponentModule>('../../../../pages/Travel/TravelTerms').default,
    [SCREENS.TRAVEL.UPGRADE]: () => require<ReactComponentModule>('../../../../pages/Travel/TravelUpgrade').default,
    [SCREENS.TRAVEL.TRIP_SUMMARY]: () => require<ReactComponentModule>('../../../../pages/Travel/TripSummaryPage').default,
    [SCREENS.TRAVEL.TRIP_DETAILS]: () => require<ReactComponentModule>('../../../../pages/Travel/TripDetailsPage').default,
    [SCREENS.TRAVEL.DOMAIN_SELECTOR]: () => require<ReactComponentModule>('../../../../pages/Travel/DomainSelectorPage').default,
    [SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO]: () => require<ReactComponentModule>('../../../../pages/Travel/DomainPermissionInfoPage').default,
    [SCREENS.TRAVEL.PUBLIC_DOMAIN_ERROR]: () => require<ReactComponentModule>('../../../../pages/Travel/PublicDomainErrorPage').default,
    [SCREENS.TRAVEL.WORKSPACE_CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/Travel/WorkspaceConfirmationForTravelPage').default,
    [SCREENS.TRAVEL.WORKSPACE_ADDRESS]: () => require<ReactComponentModule>('../../../../pages/Travel/WorkspaceAddressForTravelPage').default,
    [SCREENS.TRAVEL.VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/Travel/VerifyAccountPage').default,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator<SplitDetailsNavigatorParamList>({
    [SCREENS.SPLIT_DETAILS.ROOT]: () => require<ReactComponentModule>('../../../../pages/iou/SplitBillDetailsPage').default,
});

const ProfileModalStackNavigator = createModalStackNavigator<ProfileNavigatorParamList>({
    [SCREENS.PROFILE_ROOT]: () => require<ReactComponentModule>('../../../../pages/ProfilePage').default,
});

const NewReportWorkspaceSelectionModalStackNavigator = createModalStackNavigator<NewReportWorkspaceSelectionNavigatorParamList>({
    [SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT]: () => require<ReactComponentModule>('../../../../pages/NewReportWorkspaceSelectionPage').default,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator<ReportDetailsNavigatorParamList>({
    [SCREENS.REPORT_DETAILS.ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportDetailsPage').default,
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: () => require<ReactComponentModule>('../../../../pages/inbox/report/ReportDetailsShareCodePage').default,
    [SCREENS.REPORT_DETAILS.EXPORT]: () => require<ReactComponentModule>('../../../../pages/inbox/report/ReportDetailsExportPage').default,
});

const ReportCardActivateStackNavigator = createModalStackNavigator<ReportCardActivateNavigatorParamList>({
    [SCREENS.REPORT_CARD_ACTIVATE]: () => require<ReactComponentModule>('../../../../pages/inbox/report/ActivatePhysicalCardPage').default,
});

const ReportChangeWorkspaceModalStackNavigator = createModalStackNavigator<ReportChangeWorkspaceNavigatorParamList>({
    [SCREENS.REPORT_CHANGE_WORKSPACE.ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportChangeWorkspacePage').default,
});

const ReportChangeApproverModalStackNavigator = createModalStackNavigator<ReportChangeApproverParamList>({
    [SCREENS.REPORT_CHANGE_APPROVER.ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportChangeApproverPage').default,
    [SCREENS.REPORT_CHANGE_APPROVER.ADD_APPROVER]: () => require<ReactComponentModule>('../../../../pages/ReportAddApproverPage').default,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator<ReportSettingsNavigatorParamList>({
    [SCREENS.REPORT_SETTINGS.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Report/ReportSettingsPage').default,
    [SCREENS.REPORT_SETTINGS.NAME]: () => require<ReactComponentModule>('../../../../pages/settings/Report/NamePage').default,
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: () => require<ReactComponentModule>('../../../../pages/settings/Report/NotificationPreferencePage').default,
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: () => require<ReactComponentModule>('../../../../pages/settings/Report/WriteCapabilityPage').default,
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: () => require<ReactComponentModule>('../../../../pages/settings/Report/VisibilityPage').default,
    [SCREENS.REPORT_SETTINGS.REPORT_LAYOUT]: () => require<ReactComponentModule>('../../../../pages/settings/Report/ReportLayoutPage').default,
});

const WorkspaceConfirmationModalStackNavigator = createModalStackNavigator<WorkspaceConfirmationNavigatorParamList>({
    [SCREENS.WORKSPACE_CONFIRMATION.ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceConfirmationPage').default,
    [SCREENS.CURRENCY.SELECTION]: () => require<ReactComponentModule>('../../../../pages/CurrencySelectionPage').default,
});

const WorkspaceDuplicateModalStackNavigator = createModalStackNavigator<WorkspaceDuplicateNavigatorParamList>({
    [SCREENS.WORKSPACE_DUPLICATE.ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/duplicate/WorkspaceDuplicatePage').default,
    [SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES]: () => require<ReactComponentModule>('../../../../pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesPage').default,
});

const TaskModalStackNavigator = createModalStackNavigator<TaskDetailsNavigatorParamList>({
    [SCREENS.TASK.TITLE]: () => require<ReactComponentModule>('../../../../pages/tasks/TaskTitlePage').default,
    [SCREENS.TASK.ASSIGNEE]: () => require<ReactComponentModule>('../../../../pages/tasks/TaskAssigneeSelectorModal').default,
});

const ReportVerifyAccountModalStackNavigator = createModalStackNavigator<ReportVerifyAccountNavigatorParamList>({
    [SCREENS.REPORT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/inbox/report/ReportVerifyAccountPage').default,
    [SCREENS.EXPENSE_REPORT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/inbox/report/ExpenseReportVerifyAccountPage').default,
    [SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/Search/SearchReportVerifyAccountPage').default,
});

const ReportDescriptionModalStackNavigator = createModalStackNavigator<ReportDescriptionNavigatorParamList>({
    [SCREENS.REPORT_DESCRIPTION_ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportDescriptionPage').default,
});

const CategoriesModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CreateCategoryPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/EditCategoryPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategorySettingsPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/ImportCategoriesPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/ImportedCategoriesPage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_PAYROLL_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryPayrollCodePage').default,
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryGLCodePage').default,
});

const TagsModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsSettingsPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceEditTagsPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportTagsOptionsPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportedTagsPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagSettingsPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceViewTagsPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceCreateTagPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/EditTagPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_APPROVER]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagApproverPage').default,
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_GL_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagGLCodePage').default,
});

const ExpensifyCardModalStackNavigator = createModalStackNavigator({
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_DETAILS]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardDetailsPage').default,
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceEditCardNamePage').default,
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceEditCardLimitPage').default,
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT_TYPE]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceEditCardLimitTypePage').default,
});

const DomainCardModalStackNavigator = createModalStackNavigator({
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ExpensifyCardPage/index').default,
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportVirtualCardFraudPage').default,
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_UPDATE_ADDRESS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/PersonalAddressPage').default,
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_CONFIRM_MAGIC_CODE]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardVerifyAccountPage').default,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator<ParticipantsNavigatorParamList>({
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: () => require<ReactComponentModule>('../../../../pages/ReportParticipantsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: () => require<ReactComponentModule>('../../../../pages/InviteReportParticipantsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: () => require<ReactComponentModule>('../../../../pages/ReportParticipantDetailsPage').default,
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: () => require<ReactComponentModule>('../../../../pages/ReportParticipantRoleSelectionPage').default,
});

const RoomMembersModalStackNavigator = createModalStackNavigator<RoomMembersNavigatorParamList>({
    [SCREENS.ROOM_MEMBERS.ROOT]: () => require<ReactComponentModule>('../../../../pages/RoomMembersPage').default,
    [SCREENS.ROOM_MEMBERS.INVITE]: () => require<ReactComponentModule>('../../../../pages/RoomInvitePage').default,
    [SCREENS.ROOM_MEMBERS.DETAILS]: () => require<ReactComponentModule>('../../../../pages/RoomMemberDetailsPage').default,
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

const ConsoleModalStackNavigator = createModalStackNavigator<ConsoleNavigatorParamList>({
    [SCREENS.PUBLIC_CONSOLE_DEBUG]: () => require<ReactComponentModule>('../../../../pages/settings/AboutPage/ConsolePage').default,
});

const SettingsModalStackNavigator = createModalStackNavigator<SettingsNavigatorParamList>({
    [SCREENS.SETTINGS.SHARE_CODE]: () => require<ReactComponentModule>('../../../../pages/ShareCodePage').default,
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PronounsPage').default,
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/DisplayNamePage').default,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/TimezoneInitialPage').default,
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/TimezoneSelectPage').default,
    [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default,
    [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default,
    [SCREENS.SETTINGS.PROFILE.PHONE_NUMBER]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/PhoneNumberPage').default,
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/PersonalAddressPage').default,
    [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/CountrySelectionPage').default,
    [SCREENS.SETTINGS.PROFILE.ADDRESS_STATE]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/StateSelectionPage').default,
    [SCREENS.SETTINGS.PROFILE.AVATAR]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/Avatar/AvatarPage').default,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/Contacts/ContactMethodsPage').default,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default,
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/Contacts/NewContactMethodPage').default,
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Profile/Contacts/NewContactMethodConfirmMagicCodePage').default,
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/Contacts/VerifyAccountPage').default,
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/PriorityModePage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/PolicyAccountingPage').default,
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/LanguagePage').default,
    [SCREENS.SETTINGS.PREFERENCES.THEME]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/ThemePage').default,
    [SCREENS.SETTINGS.PREFERENCES.PAYMENT_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/PaymentCurrencyPage').default,
    [SCREENS.SETTINGS.CLOSE]: () => require<ReactComponentModule>('../../../../pages/settings/Security/CloseAccountPage').default,
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: () => require<ReactComponentModule>('../../../../pages/settings/AppDownloadLinks').default,
    [SCREENS.SETTINGS.CONSOLE]: () => require<ReactComponentModule>('../../../../pages/settings/AboutPage/ConsolePage').default,
    [SCREENS.SETTINGS.SHARE_LOG]: () => require<ReactComponentModule>('../../../../pages/settings/AboutPage/ShareLogPage').default,
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/PersonalDetails/PersonalAddressPage').default,
    [SCREENS.SETTINGS.WALLET.VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/VerifyAccountPage').default,
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ExpensifyCardPage/index').default,
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD_CONFIRM_MAGIC_CODE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardVerifyAccountPage').default,
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/PersonalCardDetailsPage').default,
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_NAME]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/PersonalCardEditNamePage').default,
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_TRANSACTION_START_DATE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Wallet/PersonalCardEditTransactionStartDatePage').default,
    [SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardMissingDetailsPage').default,
    [SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardMissingDetailsMagicCodePage').default,
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportVirtualCardFraudPage').default,
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRM_MAGIC_CODE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportVirtualCardFraudVerifyAccountPage').default,
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportVirtualCardFraudConfirmationPage').default,
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ActivatePhysicalCardPage').default,
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/TransferBalancePage').default,
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ChooseTransferAccountPage').default,
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: () => require<ReactComponentModule>('../../../../pages/EnablePayments/EnablePayments').default,
    [SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/UnshareBankAccount/UnshareBankAccount').default,
    [SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/EnableGlobalReimbursements').default,
    [SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ShareBankAccount/ShareBankAccount').default,
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/AddDebitCardPage').default,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/NewBankAccountVerifyAccountPage').default,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/InternationalDepositAccount').default,
    [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT_ENTRY_POINT]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Wallet/InternationalDepositAccount/substeps/AccountFlowEntryPoint').default,
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Wallet/InternationalDepositAccount/CountrySelectionVerifyAccountPage').default,
    [SCREENS.SETTINGS.RULES.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/ExpenseRulesPage').default,
    [SCREENS.SETTINGS.RULES.ADD]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/AddRulePage').default,
    [SCREENS.SETTINGS.RULES.ADD_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddMerchantPage').default,
    [SCREENS.SETTINGS.RULES.ADD_RENAME_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddRenameMerchantPage').default,
    [SCREENS.SETTINGS.RULES.ADD_CATEGORY]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddCategoryPage').default,
    [SCREENS.SETTINGS.RULES.ADD_TAG]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddTagPage').default,
    [SCREENS.SETTINGS.RULES.ADD_TAX]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddTaxRatePage').default,
    [SCREENS.SETTINGS.RULES.ADD_DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddDescriptionPage').default,
    [SCREENS.SETTINGS.RULES.ADD_REIMBURSABLE]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddReimbursablePage').default,
    [SCREENS.SETTINGS.RULES.ADD_BILLABLE]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddBillablePage').default,
    [SCREENS.SETTINGS.RULES.ADD_REPORT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddReportPage').default,
    [SCREENS.SETTINGS.RULES.EDIT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/EditRulePage').default,
    [SCREENS.SETTINGS.RULES.EDIT_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddMerchantPage').default,
    [SCREENS.SETTINGS.RULES.EDIT_RENAME_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddRenameMerchantPage').default,
    [SCREENS.SETTINGS.RULES.EDIT_CATEGORY]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddCategoryPage').default,
    [SCREENS.SETTINGS.RULES.EDIT_TAG]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddTagPage').default,
    [SCREENS.SETTINGS.RULES.EDIT_TAX]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddTaxRatePage').default,
    [SCREENS.SETTINGS.RULES.EDIT_DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddDescriptionPage').default,
    [SCREENS.SETTINGS.RULES.EDIT_REIMBURSABLE]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddReimbursablePage').default,
    [SCREENS.SETTINGS.RULES.EDIT_BILLABLE]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddBillablePage').default,
    [SCREENS.SETTINGS.RULES.EDIT_REPORT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/Fields/AddReportPage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/CustomStatus/StatusPage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/CustomStatus/StatusClearAfterPage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/CustomStatus/SetDatePage').default,
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/CustomStatus/SetTimePage').default,
    [SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/CustomStatus/VacationDelegatePage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSize').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.SETTINGS_DETAILS]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSettings').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.DISABLE_AUTO_RENEW_SURVEY]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/DisableAutoRenewSurveyPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.REQUEST_EARLY_CANCELLATION]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/RequestEarlyCancellationPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.SUBSCRIPTION_DOWNGRADE_BLOCKED]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionPlan/SubscriptionPlanDowngradeBlockedPage').default,
    [SCREENS.WORKSPACE.INVITE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceInvitePage').default,
    [SCREENS.WORKSPACE.MEMBERS_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/members/ImportMembersPage').default,
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED]: () => require<ReactComponentModule>('../../../../pages/workspace/members/ImportedMembersPage').default,
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED_CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/workspace/members/ImportedMembersConfirmationPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsCreatePage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsEditPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsExpensesFromPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsApproverPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsApproverPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsApprovalLimitPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsOverLimitApproverPage').default,
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceInviteMessagePage').default,
    [SCREENS.WORKSPACE.INVITE_MESSAGE_ROLE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceInviteMessageRolePage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/WorkspaceWorkflowsPayerPage').default,
    [SCREENS.WORKSPACE.NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceNamePage').default,
    [SCREENS.WORKSPACE.DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceOverviewDescriptionPage').default,
    [SCREENS.WORKSPACE.SHARE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceOverviewSharePage').default,
    [SCREENS.WORKSPACE.CURRENCY]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceOverviewCurrencyPage').default,
    [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategorySettingsPage').default,
    [SCREENS.WORKSPACE.CATEGORY_REQUIRED_FIELDS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryRequiredFieldsPage').default,
    [SCREENS.WORKSPACE.ADDRESS]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceOverviewAddressPage').default,
    [SCREENS.WORKSPACE.PLAN]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceOverviewPlanTypePage').default,
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesSettingsPage').default,
    [SCREENS.WORKSPACE.CATEGORIES_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/ImportCategoriesPage').default,
    [SCREENS.WORKSPACE.CATEGORIES_IMPORTED]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/ImportedCategoriesPage').default,
    [SCREENS.WORKSPACE.UPGRADE]: () => require<ReactComponentModule>('../../../../pages/workspace/upgrade/WorkspaceUpgradePage').default,
    [SCREENS.WORKSPACE.DOWNGRADE]: () => require<ReactComponentModule>('../../../../pages/workspace/downgrade/WorkspaceDowngradePage').default,
    [SCREENS.WORKSPACE.PAY_AND_DOWNGRADE]: () => require<ReactComponentModule>('../../../../pages/workspace/downgrade/PayAndDowngradePage').default,
    [SCREENS.WORKSPACE.MEMBER_DETAILS]: () => require<ReactComponentModule>('../../../../pages/workspace/members/WorkspaceMemberDetailsPage').default,
    [SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE]: () => require<ReactComponentModule>('../../../../pages/workspace/members/WorkspaceMemberDetailsRolePage').default,
    [SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD]: () => require<ReactComponentModule>('../../../../pages/workspace/members/WorkspaceMemberCustomFieldPage').default,
    [SCREENS.WORKSPACE.OWNER_CHANGE_CHECK]: () => require<ReactComponentModule>('@pages/workspace/members/WorkspaceOwnerChangeWrapperPage').default,
    [SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS]: () => require<ReactComponentModule>('../../../../pages/workspace/members/WorkspaceOwnerChangeSuccessPage').default,
    [SCREENS.WORKSPACE.OWNER_CHANGE_ERROR]: () => require<ReactComponentModule>('../../../../pages/workspace/members/WorkspaceOwnerChangeErrorPage').default,
    [SCREENS.WORKSPACE.CATEGORY_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CreateCategoryPage').default,
    [SCREENS.WORKSPACE.CATEGORY_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/EditCategoryPage').default,
    [SCREENS.WORKSPACE.CATEGORY_PAYROLL_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryPayrollCodePage').default,
    [SCREENS.WORKSPACE.CATEGORY_GL_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryGLCodePage').default,
    [SCREENS.WORKSPACE.CATEGORY_DEFAULT_TAX_RATE]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryDefaultTaxRatePage').default,
    [SCREENS.WORKSPACE.CATEGORY_FLAG_AMOUNTS_OVER]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryFlagAmountsOverPage').default,
    [SCREENS.WORKSPACE.CATEGORY_DESCRIPTION_HINT]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryDescriptionHintPage').default,
    [SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryRequireReceiptsOverPage').default,
    [SCREENS.WORKSPACE.CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryRequireItemizedReceiptsOverPage').default,
    [SCREENS.WORKSPACE.CATEGORY_APPROVER]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/CategoryApproverPage').default,
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/CreateDistanceRatePage').default,
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE_UPGRADE]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/CreateDistanceRatePage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRatesSettingsPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateDetailsPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateEditPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateNameEditPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateTaxReclaimableEditPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRateTaxRateEditPage').default,
    [SCREENS.WORKSPACE.TAGS_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportTagsOptionsPage').default,
    [SCREENS.WORKSPACE.TAGS_IMPORT_MULTI_LEVEL_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportMultiLevelTagsSettingsPage').default,
    [SCREENS.WORKSPACE.TAGS_IMPORTED]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportedTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_IMPORTED_MULTI_LEVEL]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/ImportedMultiLevelTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsSettingsPage').default,
    [SCREENS.WORKSPACE.TAG_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagSettingsPage').default,
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceViewTagsPage').default,
    [SCREENS.WORKSPACE.TAGS_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceEditTagsPage').default,
    [SCREENS.WORKSPACE.TAG_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceCreateTagPage').default,
    [SCREENS.WORKSPACE.TAG_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/EditTagPage').default,
    [SCREENS.WORKSPACE.TAG_APPROVER]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagApproverPage').default,
    [SCREENS.WORKSPACE.TAG_GL_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/TagGLCodePage').default,
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
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_AUTO_SYNC]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNTING_METHOD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAccountingMethodPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksCompanyCardExpenseAccountPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/export/QuickbooksPreferredExporterConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopCompanyCardExpenseAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopNonReimbursableDefaultVendorSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopCompanyCardExpenseAccountPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopExportDateSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_PREFERRED_EXPORTER]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopPreferredExporterConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopOutOfPocketExpenseAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopOutOfPocketExpenseConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopOutOfPocketExpenseEntitySelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/export/QuickbooksDesktopExportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ADVANCED]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/advanced/QuickbooksDesktopAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_AUTO_SYNC]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/advanced/QuickbooksDesktopAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/advanced/QuickbooksDesktopAccountingMethodPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_MODAL]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/QuickBooksDesktopSetupPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/RequireQuickBooksDesktopPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/QuickBooksDesktopSetupFlowSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopChartOfAccountsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopClassesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopClassesDisplayedAsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopCustomersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopCustomersDisplayedAsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ITEMS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbd/import/QuickbooksDesktopItemsPage').default,
    [SCREENS.CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT_ROOT]: () => require<ReactComponentModule>('@pages/workspace/ConnectExistingBusinessBankAccountPage').default,
    [SCREENS.REIMBURSEMENT_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
    [SCREENS.REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/ReimbursementAccount/ReimbursementAccountVerifyAccountPage').default,
    [SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO]: () => require<ReactComponentModule>('../../../../pages/ReimbursementAccount/EnterSignerInfo').default,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportCardLostPage').default,
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/ReportCardLostConfirmMagicCodePage').default,
    [SCREENS.KEYBOARD_SHORTCUTS]: () => require<ReactComponentModule>('../../../../pages/KeyboardShortcutsPage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: () => require<ReactComponentModule>('../../../../pages/settings/ExitSurvey/ExitSurveyReasonPage').default,
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: () => require<ReactComponentModule>('../../../../pages/settings/ExitSurvey/ExitSurveyConfirmPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksChartOfAccountsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksCustomersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksTaxesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksLocationsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksClassesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksClassesDisplayedAsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksCustomersDisplayedAsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/import/QuickbooksLocationsDisplayedAsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/qbo/advanced/QuickbooksInvoiceAccountSelectPage').default,

    [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/XeroImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.CLAIM_OFFER]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/ClaimOfferPage').default,
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
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_AUTO_SYNC]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/advanced/XeroAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ACCOUNTING_METHOD]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/advanced/XeroAccountingMethodPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroPurchaseBillStatusSelectorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/advanced/XeroInvoiceAccountSelectorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/export/XeroPreferredExporterSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/xero/advanced/XeroBillPaymentAccountSelectorPage').default,

    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SUBSIDIARY_SELECTOR]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/NetSuiteSubsidiarySelector').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REUSE_EXISTING_CONNECTIONS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/NetSuiteTokenInput/NetSuiteExistingConnectionsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TOKEN_INPUT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/NetSuiteTokenInput/NetSuiteTokenInputPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_MAPPING]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportMappingPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_VIEW]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldView').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_EDIT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldEdit').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_ADD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteImportAddCustomListPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteImportAddCustomSegmentPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomersOrProjectsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/import/NetSuiteImportCustomersOrProjectSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteExportConfigurationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PREFERRED_EXPORTER_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuitePreferredExporterSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteDateSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteExportExpensesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteExportExpensesDestinationSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteExportExpensesVendorSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteExportExpensesPayableAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteExportExpensesJournalPostingPreferenceSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_RECEIVABLE_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteReceivableAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteInvoiceItemPreferenceSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteInvoiceItemSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TAX_POSTING_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteTaxPostingAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/export/NetSuiteProvincialTaxPostingAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_ADVANCED]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteReimbursementAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_COLLECTION_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteCollectionAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteExpenseReportApprovalLevelSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteVendorBillApprovalLevelSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteJournalEntryApprovalLevelSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_APPROVAL_ACCOUNT_SELECT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteApprovalAccountSelectPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_CUSTOM_FORM_ID]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteCustomFormIDPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_AUTO_SYNC]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_ACCOUNTING_METHOD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/netsuite/advanced/NetSuiteAccountingMethodPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/SageIntacctPrerequisitesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ENTER_SAGE_INTACCT_CREDENTIALS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/EnterSageIntacctCredentialsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/ExistingConnectionsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ENTITY]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/SageIntacctEntityPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctExportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctPreferredExporterPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctDatePage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctReimbursableExpensesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctNonReimbursableExpensesPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_DESTINATION]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctReimbursableExpensesDestinationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctNonReimbursableExpensesDestinationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctDefaultVendorPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/export/SageIntacctNonReimbursableCreditCardAccountPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADVANCED]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/advanced/SageIntacctAdvancedPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_AUTO_SYNC]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/advanced/SageIntacctAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ACCOUNTING_METHOD]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/advanced/SageIntacctAccountingMethodPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PAYMENT_ACCOUNT]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/advanced/SageIntacctPaymentAccountPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/reconciliation/CardReconciliationPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION_QUICKBOOKS_DESKTOP_AUTO_SYNC]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/reconciliation/CardReconciliationQuickbooksDesktopAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/reconciliation/CardReconciliationSageIntacctAutoSyncPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/reconciliation/ReconciliationAccountSettingsPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/WorkspaceAutoReportingMonthlyOffsetPage').default,
    [SCREENS.WORKSPACE.TAX_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceEditTaxPage').default,
    [SCREENS.WORKSPACE.TAX_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/NamePage').default,
    [SCREENS.WORKSPACE.TAX_VALUE]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/ValuePage').default,
    [SCREENS.WORKSPACE.TAX_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceCreateTaxPage').default,
    [SCREENS.WORKSPACE.TAX_CODE]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxCodePage').default,
    [SCREENS.WORKSPACE.INVOICES_COMPANY_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/invoices/WorkspaceInvoicingDetailsName').default,
    [SCREENS.WORKSPACE.INVOICES_COMPANY_WEBSITE]: () => require<ReactComponentModule>('../../../../pages/workspace/invoices/WorkspaceInvoicingDetailsWebsite').default,
    [SCREENS.WORKSPACE.INVOICES_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/invoices/WorkspaceInvoicesVerifyAccountPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/BrokenCardFeedConnectionPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/assignCard/AssigneeStep').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/assignCard/CardSelectionStep').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/companyCards/assignCard/TransactionStartDateStep').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/assignCard/CardNameStep').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/assignCard/ConfirmationStep').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/assignCard/InviteNewMemberStep').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardFeedSelectorPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/BankConnection').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/addNew/AddNewCardPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARD_DETAILS]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardDetailsPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardEditCardNamePage').default,
    [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_TRANSACTION_START_DATE]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardEditTransactionStartDatePage').default,
    [SCREENS.WORKSPACE.COMPANY_CARD_EXPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardAccountSelectCardPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/issueNew/IssueNewCardPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/issueNew/IssueNewCardConfirmMagicCodePage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceCardSettingsPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceSettlementAccountPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceSettlementFrequencyPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SELECT_FEED]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardSelectorPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardBankAccounts').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardDetailsPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceEditCardNamePage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceEditCardLimitPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceEditCardLimitTypePage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardsSettingsPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardsSettingsFeedNamePage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardStatementCloseDatePage').default,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/PaymentCard/ChangeCurrency').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/PaymentCard/ChangeBillingCurrency').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/PaymentCard').default,
    [SCREENS.SETTINGS.ADD_PAYMENT_CARD_CHANGE_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/settings/PaymentCard/ChangeCurrency').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_CREATE]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/CreateReportFieldsPage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportFieldsSettingsPage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportFieldsListValuesPage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportFieldsAddListValuePage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportFieldsValueSettingsPage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportFieldsInitialValuePage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportFieldsEditValuePage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctImportPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_TOGGLE_MAPPING]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctToggleMappingsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctMappingsTypePage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctImportTaxPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX_MAPPING]: () => {
        return require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctImportTaxMappingPage').default;
    },
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_USER_DIMENSIONS]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctUserDimensionsPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADD_USER_DIMENSION]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctAddUserDimensionPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION]: () =>
        require<ReactComponentModule>('../../../../pages/workspace/accounting/intacct/import/SageIntacctEditUserDimensionsPage').default,
    [SCREENS.SETTINGS.DELEGATE.VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/VerifyAccountPage').default,
    [SCREENS.SETTINGS.DELEGATE.ADD_DELEGATE]: () => require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/AddDelegatePage').default,
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE]: () => require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/SelectDelegateRolePage').default,
    [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/UpdateDelegateRole/UpdateDelegateRolePage').default,
    [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE]: () =>
        require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/UpdateDelegateRole/UpdateDelegateMagicCodePage').default,
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: () => require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/ConfirmDelegatePage').default,
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM_MAGIC_CODE]: () => require<ReactComponentModule>('../../../../pages/settings/Security/AddDelegate/ConfirmDelegateMagicCodePage').default,
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS]: () => require<ReactComponentModule>('../../../../pages/settings/Security/MergeAccounts/AccountDetailsPage').default,
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE]: () => require<ReactComponentModule>('../../../../pages/settings/Security/MergeAccounts/AccountValidatePage').default,
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/MergeAccounts/MergeResultPage').default,
    [SCREENS.SETTINGS.LOCK.LOCK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/LockAccount/LockAccountPage').default,
    [SCREENS.SETTINGS.LOCK.UNLOCK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/LockAccount/UnlockAccountPage').default,
    [SCREENS.SETTINGS.LOCK.FAILED_TO_LOCK_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/LockAccount/FailedToLockAccountPage').default,
    [SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/ReportsDefaultTitle').default,
    [SCREENS.WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesAutoApproveReportsUnderPage').default,
    [SCREENS.WORKSPACE.RULES_RANDOM_REPORT_AUDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesRandomReportAuditPage').default,
    [SCREENS.WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesAutoPayReportsUnderPage').default,
    [SCREENS.WORKSPACE.RULES_RECEIPT_REQUIRED_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesReceiptRequiredAmountPage').default,
    [SCREENS.WORKSPACE.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesItemizedReceiptRequiredAmountPage').default,
    [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesMaxExpenseAmountPage').default,
    [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AGE]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesMaxExpenseAgePage').default,
    [SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesBillableDefaultPage').default,
    [SCREENS.WORKSPACE.RULES_REIMBURSABLE_DEFAULT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesReimbursableDefaultPage').default,
    [SCREENS.WORKSPACE.RULES_CUSTOM]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesCustomPage').default,
    [SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/RulesProhibitedDefaultPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_NEW]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddMerchantRulePage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddMerchantToMatchPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddMatchTypePage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddMerchantPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_CATEGORY]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddCategoryPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_TAG]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddTagPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_TAX]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddTaxPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddDescriptionPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_REIMBURSABLE]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddReimbursablePage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/AddBillablePage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/PreviewMatchesPage').default,
    [SCREENS.WORKSPACE.RULES_MERCHANT_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/MerchantRules/EditMerchantRulePage').default,
    [SCREENS.WORKSPACE.PER_DIEM_IMPORT]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/ImportPerDiemPage').default,
    [SCREENS.WORKSPACE.PER_DIEM_IMPORTED]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/ImportedPerDiemPage').default,
    [SCREENS.WORKSPACE.PER_DIEM_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/WorkspacePerDiemSettingsPage').default,
    [SCREENS.WORKSPACE.PER_DIEM_DETAILS]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/WorkspacePerDiemDetailsPage').default,
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_DESTINATION]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/EditPerDiemDestinationPage').default,
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_SUBRATE]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/EditPerDiemSubratePage').default,
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_AMOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/EditPerDiemAmountPage').default,
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_CURRENCY]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/EditPerDiemCurrencyPage').default,
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE]: () => require<ReactComponentModule>('../../../../pages/workspace/receiptPartners/InviteReceiptPartnerPolicyPage').default,
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT]: () => require<ReactComponentModule>('../../../../pages/workspace/receiptPartners/EditInviteReceiptPartnerPolicyPage').default,
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/workspace/receiptPartners/ChangeReceiptBillingAccountPage').default,
    [SCREENS.WORKSPACE.TIME_TRACKING_DEFAULT_RATE]: () => require<ReactComponentModule>('../../../../pages/workspace/timeTracking/WorkspaceTimeTrackingDefaultRatePage').default,
    [SCREENS.DOMAIN.VERIFY]: () => require<ReactComponentModule>('../../../../pages/domain/SamlVerifyDomainPage').default,
    [SCREENS.DOMAIN.VERIFIED]: () => require<ReactComponentModule>('../../../../pages/domain/SamlDomainVerifiedPage').default,
    [SCREENS.DOMAIN.ADMIN_DETAILS]: () => require<ReactComponentModule>('../../../../pages/domain/Admins/DomainAdminDetailsPage').default,
    [SCREENS.DOMAIN.ADMINS_SETTINGS]: () => require<ReactComponentModule>('../../../../pages/domain/Admins/DomainAdminsSettingsPage').default,
    [SCREENS.DOMAIN.ADD_PRIMARY_CONTACT]: () => require<ReactComponentModule>('../../../../pages/domain/Admins/DomainAddPrimaryContactPage').default,
    [SCREENS.DOMAIN.ADD_ADMIN]: () => require<ReactComponentModule>('../../../../pages/domain/Admins/DomainAddAdminPage').default,
    [SCREENS.DOMAIN.MEMBER_DETAILS]: () => require<ReactComponentModule>('../../../../pages/domain/Members/DomainMemberDetailsPage').default,
    [SCREENS.DOMAIN.RESET_DOMAIN]: () => require<ReactComponentModule>('../../../../pages/domain/DomainResetPage').default,
    [SCREENS.DOMAIN.ADD_MEMBER]: () => require<ReactComponentModule>('../../../../pages/domain/Members/DomainAddMemberPage').default,
});

const TwoFactorAuthenticatorStackNavigator = createModalStackNavigator<EnablePaymentsNavigatorParamList>({
    [SCREENS.TWO_FACTOR_AUTH.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default,
    [SCREENS.TWO_FACTOR_AUTH.VERIFY]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/VerifyPage').default,
    [SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/VerifyAccountPage').default,
    [SCREENS.TWO_FACTOR_AUTH.DISABLED]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/DisabledPage').default,
    [SCREENS.TWO_FACTOR_AUTH.DISABLE]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/DisablePage').default,
    [SCREENS.TWO_FACTOR_AUTH.SUCCESS]: () => require<ReactComponentModule>('../../../../pages/settings/Security/TwoFactorAuth/SuccessPage').default,
});

const SearchRouterModalStackNavigator = createModalStackNavigator({
    [SCREENS.RIGHT_MODAL.SEARCH_ROUTER]: () => require<ReactComponentModule>('../../../../components/Search/SearchRouter/SearchRouterPage').default,
});

const EnablePaymentsStackNavigator = createModalStackNavigator<EnablePaymentsNavigatorParamList>({
    [SCREENS.ENABLE_PAYMENTS_ROOT]: () => require<ReactComponentModule>('../../../../pages/EnablePayments/EnablePaymentsPage').default,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator<AddPersonalBankAccountNavigatorParamList>({
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: () => require<ReactComponentModule>('../../../../pages/AddPersonalBankAccountPage').default,
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

const TransactionDuplicateStackNavigator = createModalStackNavigator<TransactionDuplicateNavigatorParamList>({
    [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/Review').default,
    [SCREENS.TRANSACTION_DUPLICATE.MERCHANT]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewMerchant').default,
    [SCREENS.TRANSACTION_DUPLICATE.CATEGORY]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewCategory').default,
    [SCREENS.TRANSACTION_DUPLICATE.TAG]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewTag').default,
    [SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewDescription').default,
    [SCREENS.TRANSACTION_DUPLICATE.TAX_CODE]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewTaxCode').default,
    [SCREENS.TRANSACTION_DUPLICATE.BILLABLE]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewBillable').default,
    [SCREENS.TRANSACTION_DUPLICATE.REIMBURSABLE]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/ReviewReimbursable').default,
    [SCREENS.TRANSACTION_DUPLICATE.CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/TransactionDuplicate/Confirmation').default,
});

const MergeTransactionStackNavigator = createModalStackNavigator<MergeTransactionNavigatorParamList>({
    [SCREENS.MERGE_TRANSACTION.LIST_PAGE]: () => require<ReactComponentModule>('../../../../pages/TransactionMerge/MergeTransactionsListPage').default,
    [SCREENS.MERGE_TRANSACTION.RECEIPT_PAGE]: () => require<ReactComponentModule>('../../../../pages/TransactionMerge/ReceiptReviewPage').default,
    [SCREENS.MERGE_TRANSACTION.DETAILS_PAGE]: () => require<ReactComponentModule>('../../../../pages/TransactionMerge/DetailsReviewPage').default,
    [SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE]: () => require<ReactComponentModule>('../../../../pages/TransactionMerge/ConfirmationPage').default,
});

const SearchReportActionsModalStackNavigator = createModalStackNavigator<SearchReportActionsParamList>({
    [SCREENS.SEARCH.ROOT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/Search/SearchRootVerifyAccountPage').default,
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/Search/SearchMoneyRequestReportVerifyAccountPage').default,
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS]: () => require<ReactComponentModule>('../../../../pages/Search/SearchHoldReasonPage').default,
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS]: () => require<ReactComponentModule>('../../../../pages/Search/SearchRejectReasonPage').default,
    [SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchHoldReasonPage').default,
    [SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchRejectReasonPage').default,
    [SCREENS.SEARCH.TRANSACTIONS_CHANGE_REPORT_SEARCH_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchTransactionsChangeReport').default,
});

const SearchAdvancedFiltersModalStackNavigator = createModalStackNavigator<SearchAdvancedFiltersParamList>({
    [SCREENS.SEARCH.ADVANCED_FILTERS_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_TYPE_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersTypePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_GROUP_BY_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersGroupByPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_STATUS_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersStatusPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_DATE_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersDatePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_SUBMITTED_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersSubmittedPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_APPROVED_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersApprovedPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_PAID_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersPaidPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_EXPORTED_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersExportedPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_POSTED_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersPostedPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_WITHDRAWN_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersWithdrawnPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_CURRENCY_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersCurrencyPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_GROUP_CURRENCY_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersGroupCurrencyPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_DESCRIPTION_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersDescriptionPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_MERCHANT_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersMerchantPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_REPORT_ID_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersReportIDPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_AMOUNT_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersAmountPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_TOTAL_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersTotalPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_CATEGORY_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersCategoryPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_KEYWORD_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersKeywordPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_CARD_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersCardPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_TAX_RATE_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersTaxRatePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_EXPENSE_TYPE_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersExpenseTypePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_WITHDRAWAL_TYPE_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersWithdrawalTypePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_IS_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersIsPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_TAG_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersTagPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_HAS_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersHasPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_LIMIT_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchAdvancedFiltersPage/SearchFiltersLimitPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_FROM_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersFromPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_TO_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersToPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_IN_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersInPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_TITLE_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersTitlePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_ASSIGNEE_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersAssigneePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_BILLABLE_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersBillablePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_REIMBURSABLE_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersReimbursablePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_WORKSPACE_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersWorkspacePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_PURCHASE_AMOUNT_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersPurchaseAmountPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_PURCHASE_CURRENCY_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersPurchaseCurrencyPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_WITHDRAWAL_ID_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersWithdrawalIDPage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_ATTENDEE_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersAttendeePage').default,
    [SCREENS.SEARCH.ADVANCED_FILTERS_REPORT_FIELD_RHP]: () => require<ReactComponentModule>('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersReportFieldPage').default,
});

const SearchSavedSearchModalStackNavigator = createModalStackNavigator<SearchSavedSearchParamList>({
    [SCREENS.SEARCH.SAVED_SEARCH_RENAME_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SavedSearchRenamePage').default,
});

const RestrictedActionModalStackNavigator = createModalStackNavigator<RestrictedActionParamList>({
    [SCREENS.RESTRICTED_ACTION_ROOT]: () => require<ReactComponentModule>('../../../../pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage').default,
});

const SearchColumnsModalStackNavigator = createModalStackNavigator<SearchColumnsParamList>({
    [SCREENS.SEARCH.COLUMNS_RHP]: () => require<ReactComponentModule>('../../../../pages/Search/SearchColumnsPage').default,
});

const ShareModalStackNavigator = createModalStackNavigator<ShareNavigatorParamList>({
    [SCREENS.SHARE.ROOT]: () => require<ReactComponentModule>('@pages/Share/ShareRootPage').default,
    [SCREENS.SHARE.SHARE_DETAILS]: () => require<ReactComponentModule>('@pages/Share/ShareDetailsPage').default,
    [SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT]: loadAttachmentModalScreen,
    [SCREENS.SHARE.SUBMIT_DETAILS]: () => require<ReactComponentModule>('@pages/Share/SubmitDetailsPage').default,
});

const MissingPersonalDetailsModalStackNavigator = createModalStackNavigator<MissingPersonalDetailsParamList>({
    [SCREENS.MISSING_PERSONAL_DETAILS]: () => require<ReactComponentModule>('../../../../pages/MissingPersonalDetails').default,
    [SCREENS.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE]: () => require<ReactComponentModule>('../../../../pages/MissingPersonalDetails/MissingPersonalDetailsMagicCodePage').default,
});

const AddUnreportedExpenseModalStackNavigator = createModalStackNavigator<AddUnreportedExpensesParamList>({
    [SCREENS.ADD_UNREPORTED_EXPENSES_ROOT]: () => require<ReactComponentModule>('../../../../pages/AddUnreportedExpense').default,
});

const DebugModalStackNavigator = createModalStackNavigator<DebugParamList>({
    [SCREENS.DEBUG.REPORT]: () => require<ReactComponentModule>('../../../../pages/Debug/Report/DebugReportPage').default,
    [SCREENS.DEBUG.REPORT_ACTION]: () => require<ReactComponentModule>('../../../../pages/Debug/ReportAction/DebugReportActionPage').default,
    [SCREENS.DEBUG.REPORT_ACTION_CREATE]: () => require<ReactComponentModule>('../../../../pages/Debug/ReportAction/DebugReportActionCreatePage').default,
    [SCREENS.DEBUG.DETAILS_CONSTANT_PICKER_PAGE]: () => require<ReactComponentModule>('../../../../pages/Debug/DebugDetailsConstantPickerPage').default,
    [SCREENS.DEBUG.DETAILS_DATE_TIME_PICKER_PAGE]: () => require<ReactComponentModule>('../../../../pages/Debug/DebugDetailsDateTimePickerPage').default,
    [SCREENS.DEBUG.TRANSACTION]: () => require<ReactComponentModule>('../../../../pages/Debug/Transaction/DebugTransactionPage').default,
    [SCREENS.DEBUG.TRANSACTION_VIOLATION_CREATE]: () => require<ReactComponentModule>('../../../../pages/Debug/TransactionViolation/DebugTransactionViolationCreatePage').default,
    [SCREENS.DEBUG.TRANSACTION_VIOLATION]: () => require<ReactComponentModule>('../../../../pages/Debug/TransactionViolation/DebugTransactionViolationPage').default,
});

const ScheduleCallModalStackNavigator = createModalStackNavigator<ScheduleCallParamList>({
    [SCREENS.SCHEDULE_CALL.BOOK]: () => require<ReactComponentModule>('../../../../pages/ScheduleCall/ScheduleCallPage').default,
    [SCREENS.SCHEDULE_CALL.CONFIRMATION]: () => require<ReactComponentModule>('../../../../pages/ScheduleCall/ScheduleCallConfirmationPage').default,
});

const WorkspacesDomainModalStackNavigator = createModalStackNavigator<WorkspacesDomainModalNavigatorParamList>({
    [SCREENS.WORKSPACES_VERIFY_DOMAIN]: () => require<ReactComponentModule>('../../../../pages/domain/WorkspacesVerifyDomainPage').default,
    [SCREENS.WORKSPACES_DOMAIN_VERIFIED]: () => require<ReactComponentModule>('../../../../pages/domain/WorkspacesDomainVerifiedPage').default,
    [SCREENS.WORKSPACES_ADD_DOMAIN]: () => require<ReactComponentModule>('../../../../pages/domain/AddDomainPage').default,
    [SCREENS.WORKSPACES_DOMAIN_ADDED]: () => require<ReactComponentModule>('../../../../pages/domain/DomainAddedPage').default,
    [SCREENS.WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT]: () => require<ReactComponentModule>('../../../../pages/domain/AddDomainVerifyAccountPage').default,
    [SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED]: () => require<ReactComponentModule>('../../../../pages/domain/DomainAccessRestrictedPage').default,
});

const MultifactorAuthenticationStackNavigator = createModalStackNavigator<MultifactorAuthenticationParamList>({
    [SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE]: () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/ValidateCodePage').default,
    [SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST]: () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/BiometricsTestPage').default,
    [SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME]: () => require<ReactComponentModule>('@pages/MultifactorAuthentication/OutcomePage').default,
    [SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT]: () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/PromptPage').default,
    [SCREENS.MULTIFACTOR_AUTHENTICATION.REVOKE]: () => require<ReactComponentModule>('@pages/MultifactorAuthentication/RevokePage').default,
    [SCREENS.MULTIFACTOR_AUTHENTICATION.NOT_FOUND]: () => require<ReactComponentModule>('../../../../pages/ErrorPage/NotFoundPage').default,
});

export {
    AddPersonalBankAccountModalStackNavigator,
    AddUnreportedExpenseModalStackNavigator,
    CategoriesModalStackNavigator,
    ConsoleModalStackNavigator,
    DebugModalStackNavigator,
    DomainCardModalStackNavigator,
    EditRequestStackNavigator,
    EnablePaymentsStackNavigator,
    ExpensifyCardModalStackNavigator,
    FlagCommentStackNavigator,
    MergeTransactionStackNavigator,
    MissingPersonalDetailsModalStackNavigator,
    MoneyRequestModalStackNavigator,
    NewChatModalStackNavigator,
    NewReportWorkspaceSelectionModalStackNavigator,
    NewTaskModalStackNavigator,
    NewTeachersUniteNavigator,
    PrivateNotesModalStackNavigator,
    ProfileModalStackNavigator,
    ReferralModalStackNavigator,
    ReportCardActivateStackNavigator,
    ReportChangeApproverModalStackNavigator,
    ReportChangeWorkspaceModalStackNavigator,
    ReportDescriptionModalStackNavigator,
    ReportDetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    ReportSettingsModalStackNavigator,
    ReportVerifyAccountModalStackNavigator,
    RestrictedActionModalStackNavigator,
    RoomMembersModalStackNavigator,
    ScheduleCallModalStackNavigator,
    SearchAdvancedFiltersModalStackNavigator,
    SearchColumnsModalStackNavigator,
    SearchReportActionsModalStackNavigator,
    SearchSavedSearchModalStackNavigator,
    SettingsModalStackNavigator,
    ShareModalStackNavigator,
    SignInModalStackNavigator,
    SplitDetailsModalStackNavigator,
    TagsModalStackNavigator,
    TaskModalStackNavigator,
    TransactionDuplicateStackNavigator,
    TravelModalStackNavigator,
    TwoFactorAuthenticatorStackNavigator,
    WalletStatementStackNavigator,
    WorkspaceConfirmationModalStackNavigator,
    WorkspaceDuplicateModalStackNavigator,
    WorkspacesDomainModalStackNavigator,
    MultifactorAuthenticationStackNavigator,
    SearchRouterModalStackNavigator,
};
