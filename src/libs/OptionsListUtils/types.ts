import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Section as SelectionListSection} from '@components/SelectionList/SelectionListWithSections/types';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';

import type {OptionData} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import type {IOUAction} from '@src/CONST';
import type {
    Beta,
    CardList,
    Login,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyTagLists,
    Report,
    ReportAction,
    ReportActions,
    ReportAttributesDerivedValue,
    TransactionViolation,
    VisibleReportActionsDerivedValue,
    WorkspaceCardsList,
} from '@src/types/onyx';
import type {Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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

/** Inputs captured by shell hydrators for one option-list build. */
type LazyHydrationContext = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
    policiesCollection: OnyxCollection<Policy>;
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined;
    policyTags: OnyxCollection<PolicyTagLists>;
    visibleReportActionsData: VisibleReportActionsDerivedValue;
    privateIsArchivedMap: PrivateIsArchivedMap;
    conciergeReportID: string | undefined;
    currentUserAccountID: number;

    /** Date-fns locale used when the option list was built. */
    dateFnsLocale: DateFnsLocale | undefined;

    /** Locale used when the option list was built. */
    translate: LocalizedTranslate;
};

type SearchOption<T> = SearchOptionData & {
    item: T;
};

/** Filter/rank fields for a contact. Hydrate before rendering. */
type PersonalDetailShell = Pick<
    SearchOptionData,
    // Identity
    | 'reportID'
    | 'keyForList'
    | 'login'
    | 'accountID'
    | 'text'
    | 'displayName'
    | 'participantsList'
    | 'isOptimisticPersonalDetail'

    // Initialized to their falsy defaults by the shell builder; getValidOptions marks the hydrated copy.
    | 'isSelected'
    | 'selected'
> & {
    item: PersonalDetails | null;

    /** Discriminates a shell from a display-ready option. */
    isHydrated: false;

    /** Builds the memoized display option. */
    hydrate: () => HydratedPersonalDetailOption;
};

type HydratedPersonalDetailOption = SearchOption<PersonalDetails | null> & {isHydrated: true};

type PersonalDetailOptionOrShell = PersonalDetailShell | HydratedPersonalDetailOption;

/**
 * The only fields filtering, ranking and de-duping read off a contact option. Both halves of
 * PersonalDetailOptionOrShell satisfy it, so helpers typed against it accept shells without claiming the
 * display fields exist.
 */
type PersonalDetailFilterRankFields = Pick<SearchOptionData, 'text' | 'displayName' | 'login' | 'accountID' | 'participantsList'>;

type OptionList = {
    reports: Array<SearchOption<Report>>;
    personalDetails: PersonalDetailOptionOrShell[];
};

type Option = Partial<OptionData>;

type OptionWithKey = Option & {
    keyForList: string;
};

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
    shouldHideSelectionButton?: boolean;
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

type GetValidOptionsSharedConfig = {
    includeP2P?: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    action?: IOUAction;
    shouldBoldTitleByDefault?: boolean;
    selectedOptions?: Option[];
};

type GetValidReportsConfig = {
    dateFnsLocale: DateFnsLocale | undefined;
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
    isTimeRequest?: boolean;
    showRBR?: boolean;
    shouldShowGBR?: boolean;
    isRestrictedToPreferredPolicy?: boolean;
    preferredPolicyID?: string;
    shouldUnreadBeBold?: boolean;
    shouldAlwaysIncludeDM?: boolean;
    personalDetails?: OnyxEntry<PersonalDetailsList>;
    allPolicyTags?: OnyxCollection<PolicyTagLists>;
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
    | 'isTimeRequest'
> & {
    currentUserAccountID: number;
    currentUserLogin: string;
    conciergeReportID: string | undefined;
};

type GetOptionsConfig = {
    dateFnsLocale: DateFnsLocale | undefined;
    excludeLogins?: Record<string, boolean>;
    excludeFromSuggestionsOnly?: Record<string, boolean>;
    includeCurrentUser?: boolean;
    includeRecentReports?: boolean;
    includeSelectedOptions?: boolean;
    recentAttendees?: Option[];
    excludeHidden?: boolean;
    searchString?: string;
    searchInputValue?: string;
    maxElements?: number;
    maxRecentReportElements?: number;
    includeUserToInvite?: boolean;
    shouldAcceptName?: boolean;
    countryCode?: number;
    visibleReportActionsData?: VisibleReportActionsDerivedValue;
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];
    sortedActions?: Record<string, ReportAction[]>;
    transactionThreadIDs?: Record<string, string | undefined>;
    lastActions?: Record<string, ReportAction>;
    currentUserLogin?: string;
    cardList?: OnyxEntry<CardList>;
    workspaceCardList?: OnyxCollection<WorkspaceCardsList>;
    localeCompare?: LocaleContextProps['localeCompare'];
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'];
    convertToDisplayString?: CurrencyListActionsContextType['convertToDisplayString'];
    isTrackIntentUser?: boolean;
    /** TODO: Should be required field in the future. Refactor issue: https://github.com/Expensify/App/issues/66407 */
    isOffline?: boolean;
} & GetValidReportsConfig;

type GetUserToInviteConfig = {
    dateFnsLocale: DateFnsLocale | undefined;
    searchValue: string | undefined;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    searchInputValue?: string;
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
    currentUserEmail: string;
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
    section: SelectionListSection<OptionWithKey>;
};

type SelectionListSections = Array<SelectionListSection<OptionWithKey>>;

/** Keeps the shell/display union until the caller hydrates before rendering. */
type Options<TPersonalDetail extends SearchOptionData = SearchOptionData> = {
    recentReports: SearchOptionData[];
    personalDetails: TPersonalDetail[];
    userToInvite: SearchOptionData | null;
    currentUserOption: TPersonalDetail | null | undefined;
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

type FilterUserToInviteConfig = Pick<GetUserToInviteConfig, 'selectedOptions' | 'shouldAcceptName' | 'searchInputValue'> & {
    dateFnsLocale: DateFnsLocale | undefined;
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

type ReportAndPersonalDetailOptions<TPersonalDetail extends SearchOptionData = SearchOptionData> = Pick<Options<TPersonalDetail>, 'recentReports' | 'personalDetails' | 'workspaceChats'>;

type OptionsResult<TPersonalDetail extends SearchOptionData = SearchOptionData> = {
    options: Options<TPersonalDetail>;
    hasMore?: boolean;
};

export type {
    FilterUserToInviteConfig,
    GetOptionsConfig,
    GetUserToInviteConfig,
    GetValidReportsConfig,
    HydratedPersonalDetailOption,
    LazyHydrationContext,
    MemberForList,
    Option,
    OptionWithKey,
    OptionList,
    OptionTree,
    Options,
    OrderOptionsConfig,
    OrderReportOptionsConfig,
    PayeePersonalDetails,
    PersonalDetailFilterRankFields,
    PersonalDetailOptionOrShell,
    PersonalDetailShell,
    PreviewConfig,
    ReportAndPersonalDetailOptions,
    SearchOption,
    SearchOptionData,
    SelectionListSections,
    SectionForSearchTerm,
    IsValidReportsConfig,
    OptionsResult,
};
