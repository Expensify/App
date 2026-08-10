import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Section as SelectionListSection} from '@components/SelectionList/SelectionListWithSections/types';

import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';

import type {OptionData} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import type {IOUAction} from '@src/CONST';
import type {
    Beta,
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
} from '@src/types/onyx';
import type {Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

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

/**
 * The createOption inputs of one createFilteredOptionList run, captured so hydrating a lazy personal detail
 * option reproduces exactly what the eager build would have produced. One object is shared by every shell of
 * the run — these are references to app-wide Onyx snapshots, not copies. It is reachable only from the
 * hydration closure a shell holds, never from the shell itself, so holding a contact option gives no handle
 * on app-wide Onyx state.
 */
type LazyHydrationContext = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
    policiesCollection: OnyxCollection<Policy>;
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined;
    policyTags: OnyxCollection<PolicyTagLists>;
    visibleReportActionsData: VisibleReportActionsDerivedValue;
    privateIsArchivedMap: PrivateIsArchivedMap;
    conciergeReportID: string | undefined;

    /**
     * Bound to the locale the option list is keyed on, so the shell's display name and the hydrated option's
     * agree.
     */
    translate: LocalizedTranslate;
};

type SearchOption<T> = SearchOptionData & {
    item: T;
};

/**
 * A contact option as createFilteredOptionList produces it: the fields that filtering, ranking and de-duping
 * read, and nothing else. The display fields (icons, subtitle, lastMessageText, the display alternateText, …)
 * are deliberately absent, so reading one directly off `OptionList.personalDetails` is a compile error rather
 * than an `undefined` for code review to catch. Call hydrateLazyPersonalDetailOption to turn one into a
 * HydratedPersonalDetailOption before rendering it.
 *
 * The hydration inputs are not reachable from the shell: they live in the `hydrate` closure, so holding a
 * contact option gives no handle on the shared Onyx snapshots the build reads.
 *
 * The compile error only guards the direct read. Every display field of OptionData is optional, so a shell
 * structurally satisfies SearchOptionData: once it is handed to a helper typed against SearchOptionData or
 * Partial<SearchOptionData>, the display fields are back in scope and read as `undefined`. Prefer
 * PersonalDetailFilterRankFields for helpers that must accept either half of the union; hydrate first before
 * passing a shell anywhere that renders it.
 */
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

    // isSelected/isBold: written in place by getValidOptions once the visible options are selected.
    | 'isSelected'
    // selected: legacy duplicate, never updated after the shell is built.
    | 'selected'
    | 'isBold'
> & {
    item: PersonalDetails | null;

    /** Discriminant: this option carries filter/rank fields only, so the display fields must not be read off it. */
    isHydrated: false;

    /**
     * Written by getValidOptions when hydration is deferred, consumed by hydrateWithMarks.
     *
     * The eager path suppresses a GBR (INFO) brick road on the built option unless the caller asked for it.
     * A shell has no brickRoadIndicator to suppress yet — createOption derives it during hydration — so the
     * decision rides here instead of forcing every deferring screen to remember its own shouldShowGBR.
     */
    shouldShowGBR?: boolean;

    /**
     * Builds the full display option, memoizing the result so every clone of the same cached option list shares
     * one build. Call hydrateLazyPersonalDetailOption rather than this directly — it also handles the already
     * hydrated half of the union and returns a copy consumers may mark in place.
     */
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
    isTrackIntentUser?: boolean;
    /**
     * Return contact options as PersonalDetailShells instead of building their display fields.
     *
     * getValidOptions normally hydrates the page of contacts that survives filtering and the `maxElements` cap.
     * A screen that caps the visible rows itself, after filtering, hydrates far fewer options by deferring:
     * NewChatPage bypasses contact pagination while searching, so without this every match pays a full
     * createOption even though only one page is rendered. Do NOT reach for `maxElements` instead — it collides
     * with that screen's own hasMore/pagination accounting.
     *
     * The returned options carry the marks getValidOptions writes (isSelected / isBold / GBR suppression) but
     * none of the display fields. Pass each one through hydrateWithMarks before rendering it; the
     * PersonalDetailOptionOrShell element type is threaded through filterAndOrderOptions so forgetting to is a
     * compile error at the render site. That covers `currentUserOption` as well — it is picked out of the same
     * contact array, so `Options` is generic over the same element type.
     */
    deferContactHydration?: boolean;
    /** TODO: Should be required field in the future. Refactor issue: https://github.com/Expensify/App/issues/66407 */
    isOffline?: boolean;
} & GetValidReportsConfig;

type GetUserToInviteConfig = {
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

/**
 * The contact-option element type is a parameter so a caller that passes `deferContactHydration` keeps the
 * PersonalDetailOptionOrShell union all the way from getValidOptions through filterAndOrderOptions to the
 * render, where hydrateWithMarks turns it back into a display option. Every other caller gets the default and
 * is unaffected.
 *
 * The same generic applies to `currentUserOption` too: that is an element of `personalDetails` (getValidOptions picks it
 * out of the same array), so with hydration deferred it is a shell and must be hydrated before it is rendered.
 */
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
