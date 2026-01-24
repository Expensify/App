import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {OptionData} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type {IOUAction} from '@src/CONST';
import type {Beta, Login, PersonalDetails, PersonalDetailsList, Report, ReportActions, TransactionViolation} from '@src/types/onyx';
import type {Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

/**
 * IMPORTANT: This type is a performance-optimized subset of OptionData.
 *
 * WHEN TO UPDATE:
 * - When adding new properties to OptionData that are used in search contexts
 * - When removing properties from OptionData that are referenced here
 * - When search functionality requires additional data not currently included
 *
 * HOW TO UPDATE:
 * 1. Add/remove property keys from the Pick<> union below
 * 2. Run type checking to ensure compatibility
 * 3. Test search functionality that relies on these properties
 *
 * @see OptionData in ReportUtils.ts for the full type definition
 */
// Optimized type for SearchOption context - only includes properties actually used
type SearchOptionData = Pick<
    OptionData,
    // Core identification
    | 'reportID'
    | 'accountID'
    | 'login'
    | 'policyID'
    | 'ownerAccountID'

    // Display properties
    | 'text'
    | 'alternateText'
    | 'participantsList'
    | 'icons'
    | 'subtitle'
    | 'keyForList'
    | 'displayName'
    | 'firstName'
    | 'lastName'
    | 'avatar'
    | 'phoneNumber'
    | 'searchText'
    | 'timezone'

    // State properties
    | 'isSelected'
    | 'isDisabled'
    | 'brickRoadIndicator'
    | 'isUnread'
    | 'isPinned'
    | 'pendingAction'
    | 'allReportErrors'
    | 'isBold'
    | 'isOptimisticAccount'
    | 'isOptimisticPersonalDetail'
    | 'shouldShowSubscript'
    | 'status'

    // Type/category flags (read-only)
    | 'isPolicyExpenseChat'
    | 'isMoneyRequestReport'
    | 'isThread'
    | 'isTaskReport'
    | 'isSelfDM'
    | 'isChatRoom'
    | 'isInvoiceRoom'
    | 'isDefaultRoom'
    | 'isDM'

    // Status properties
    | 'private_isArchived'
    | 'lastVisibleActionCreated'
    | 'notificationPreference'
    | 'lastMessageText'
    | 'lastIOUCreationDate'

    // Legacy properties kept for backwards compatibility
    | 'selected' // Duplicate of isSelected, kept for backwards compatibility
>;

type SearchOption<T> = SearchOptionData & {
    item: T;
};

type OptionList = {
    reports: Array<SearchOption<Report>>;
    personalDetails: Array<SearchOption<PersonalDetails>>;
};

type Option = Partial<OptionData>;

/**
 * A narrowed version of `Option` is used when we have a guarantee that given values exist.
 */
type OptionTree = {
    text: string;
    keyForList: string;
    searchText: string;
    tooltipText: string;
    isDisabled: boolean;
    isSelected: boolean;
    pendingAction?: PendingAction;
} & Option;

type PayeePersonalDetails = {
    text: string;
    alternateText: string;
    icons: Icon[];
    descriptiveText: string;
    login: string;
    accountID: number;
    keyForList: string;
    isInteractive: boolean;
};

type SectionBase = {
    title: string | undefined;
    shouldShow: boolean;
};

type Section = SectionBase & {
    data: Option[];
};

type GetValidOptionsSharedConfig = {
    includeP2P?: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    action?: IOUAction;
    shouldBoldTitleByDefault?: boolean;
    selectedOptions?: Option[];
};

type GetValidReportsConfig = {
    betas?: OnyxEntry<Beta[]>;
    includeMultipleParticipantReports?: boolean;
    showChatPreviewLine?: boolean;
    forcePolicyNamePreview?: boolean;
    includeSelfDM?: boolean;
    includeOwnedWorkspaceChats?: boolean;
    includeThreads?: boolean;
    includeTasks?: boolean;
    includeMoneyRequests?: boolean;
    includeInvoiceRooms?: boolean;
    includeDomainEmail?: boolean;
    includeReadOnly?: boolean;
    loginsToExclude?: Record<string, boolean>;
    shouldSeparateWorkspaceChat?: boolean;
    shouldSeparateSelfDMChat?: boolean;
    excludeNonAdminWorkspaces?: boolean;
    isPerDiemRequest?: boolean;
    showRBR?: boolean;
    shouldShowGBR?: boolean;
    isRestrictedToPreferredPolicy?: boolean;
    preferredPolicyID?: string;
    shouldUnreadBeBold?: boolean;
    shouldAlwaysIncludeDM?: boolean;
    personalDetails?: OnyxEntry<PersonalDetailsList>;
} & GetValidOptionsSharedConfig;

type IsValidReportsConfig = Pick<
    GetValidReportsConfig,
    | 'betas'
    | 'includeMultipleParticipantReports'
    | 'includeOwnedWorkspaceChats'
    | 'includeThreads'
    | 'includeTasks'
    | 'includeMoneyRequests'
    | 'includeReadOnly'
    | 'transactionViolations'
    | 'includeSelfDM'
    | 'includeInvoiceRooms'
    | 'action'
    | 'includeP2P'
    | 'includeDomainEmail'
    | 'loginsToExclude'
    | 'excludeNonAdminWorkspaces'
    | 'isRestrictedToPreferredPolicy'
    | 'preferredPolicyID'
    | 'shouldAlwaysIncludeDM'
>;

type GetOptionsConfig = {
    excludeLogins?: Record<string, boolean>;
    excludeFromSuggestionsOnly?: Record<string, boolean>;
    includeCurrentUser?: boolean;
    includeRecentReports?: boolean;
    includeSelectedOptions?: boolean;
    recentAttendees?: Option[];
    excludeHiddenThreads?: boolean;
    canShowManagerMcTest?: boolean;
    searchString?: string;
    maxElements?: number;
    maxRecentReportElements?: number;
    includeUserToInvite?: boolean;
    shouldAcceptName?: boolean;
} & GetValidReportsConfig;

type GetUserToInviteConfig = {
    searchValue: string | undefined;
    loginsToExclude?: Record<string, boolean>;
    reportActions?: ReportActions;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: AvatarSource;
    shouldAcceptName?: boolean;
    optionsToExclude?: GetOptionsConfig['selectedOptions'];
    countryCode?: number;
    loginList: OnyxEntry<Login>;
} & Pick<GetOptionsConfig, 'selectedOptions' | 'showChatPreviewLine'>;

type MemberForList = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    isDisabled: boolean;
    accountID?: number;
    login: string;
    icons?: Icon[];
    pendingAction?: PendingAction;
    reportID: string;
};

type SectionForSearchTerm = {
    section: Section;
};

type Options = {
    recentReports: SearchOptionData[];
    personalDetails: SearchOptionData[];
    userToInvite: SearchOptionData | null;
    currentUserOption: SearchOptionData | null | undefined;
    workspaceChats?: SearchOptionData[];
    selfDMChat?: SearchOptionData | undefined;
};

type PreviewConfig = {
    showChatPreviewLine?: boolean;
    forcePolicyNamePreview?: boolean;
    showPersonalDetails?: boolean;
    isDisabled?: boolean | null;
    selected?: boolean;
    isSelected?: boolean;
};

type FilterUserToInviteConfig = Pick<GetUserToInviteConfig, 'selectedOptions' | 'shouldAcceptName'> & {
    canInviteUser?: boolean;
    excludeLogins?: Record<string, boolean>;
};

type OrderOptionsConfig =
    | {
          maxRecentReportsToShow?: never;
          /* When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well. */
          sortByReportTypeInSearch?: true;
      }
    | {
          // When specifying maxRecentReportsToShow, you can't sort by report type in search
          maxRecentReportsToShow?: number;
          sortByReportTypeInSearch?: false;
      };

type OrderReportOptionsConfig = {
    preferChatRoomsOverThreads?: boolean;
    preferPolicyExpenseChat?: boolean;
    preferRecentExpenseReports?: boolean;
};

type ReportAndPersonalDetailOptions = Pick<Options, 'recentReports' | 'personalDetails' | 'workspaceChats'>;

export type {
    FilterUserToInviteConfig,
    GetOptionsConfig,
    GetUserToInviteConfig,
    GetValidOptionsSharedConfig,
    GetValidReportsConfig,
    MemberForList,
    Option,
    OptionList,
    OptionTree,
    Options,
    OrderOptionsConfig,
    OrderReportOptionsConfig,
    PayeePersonalDetails,
    PreviewConfig,
    ReportAndPersonalDetailOptions,
    SearchOption,
    SearchOptionData,
    Section,
    SectionBase,
    SectionForSearchTerm,
    IsValidReportsConfig,
};
