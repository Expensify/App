/* eslint-disable no-continue */
import {Str} from 'expensify-common';
// eslint-disable-next-line you-dont-need-lodash-underscore/get
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import lodashSet from 'lodash/set';
import lodashSortBy from 'lodash/sortBy';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SetNonNullable} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {SelectedTagOption} from '@components/TagPicker';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    Login,
    OnyxInputOrEntry,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyCategories,
    PolicyCategory,
    PolicyTag,
    PolicyTagLists,
    PolicyTags,
    Report,
    ReportAction,
    ReportActions,
    TaxRate,
    TaxRates,
    TaxRatesWithDefault,
    Transaction,
    TransactionViolation,
} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import times from '@src/utils/times';
import Timing from './actions/Timing';
import * as ErrorUtils from './ErrorUtils';
import filterArrayByMatch from './filterArrayByMatch';
import localeCompare from './LocaleCompare';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as LoginUtils from './LoginUtils';
import ModifiedExpenseMessage from './ModifiedExpenseMessage';
import Navigation from './Navigation/Navigation';
import Performance from './Performance';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as PhoneNumber from './PhoneNumber';
import * as PolicyUtils from './PolicyUtils';
import * as ReportActionUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
import * as TaskUtils from './TaskUtils';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';

type SearchOption<T> = ReportUtils.OptionData & {
    item: T;
};

type OptionList = {
    reports: Array<SearchOption<Report>>;
    personalDetails: Array<SearchOption<PersonalDetails>>;
};

type Option = Partial<ReportUtils.OptionData>;

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
    pendingAction?: OnyxCommon.PendingAction;
} & Option;

type PayeePersonalDetails = {
    text: string;
    alternateText: string;
    icons: OnyxCommon.Icon[];
    descriptiveText: string;
    login: string;
    accountID: number;
    keyForList: string;
};

type CategorySectionBase = {
    title: string | undefined;
    shouldShow: boolean;
};

type CategorySection = CategorySectionBase & {
    data: Option[];
};

type TaxRatesOption = {
    text?: string;
    code?: string;
    searchText?: string;
    tooltipText?: string;
    isDisabled?: boolean;
    keyForList?: string;
    isSelected?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
};

type TaxSection = {
    title: string | undefined;
    shouldShow: boolean;
    data: TaxRatesOption[];
};

type CategoryTreeSection = CategorySectionBase & {
    data: OptionTree[];
    indexOffset?: number;
};

type Category = {
    name: string;
    enabled: boolean;
    isSelected?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
};

type Tax = {
    modifiedName: string;
    isSelected?: boolean;
    isDisabled?: boolean;
};

type Hierarchy = Record<string, Category & {[key: string]: Hierarchy & Category}>;

type GetOptionsConfig = {
    reportActions?: ReportActions;
    betas?: OnyxEntry<Beta[]>;
    selectedOptions?: Option[];
    maxRecentReportsToShow?: number;
    excludeLogins?: string[];
    includeMultipleParticipantReports?: boolean;
    includeRecentReports?: boolean;
    includeSelfDM?: boolean;
    sortByReportTypeInSearch?: boolean;
    searchInputValue?: string;
    showChatPreviewLine?: boolean;
    sortPersonalDetailsByAlphaAsc?: boolean;
    forcePolicyNamePreview?: boolean;
    includeOwnedWorkspaceChats?: boolean;
    includeThreads?: boolean;
    includeTasks?: boolean;
    includeMoneyRequests?: boolean;
    excludeUnknownUsers?: boolean;
    includeP2P?: boolean;
    includeCategories?: boolean;
    categories?: PolicyCategories;
    recentlyUsedCategories?: string[];
    includeTags?: boolean;
    tags?: PolicyTags | Array<SelectedTagOption | PolicyTag>;
    recentlyUsedTags?: string[];
    canInviteUser?: boolean;
    includeSelectedOptions?: boolean;
    includeTaxRates?: boolean;
    taxRates?: TaxRatesWithDefault;
    policy?: OnyxEntry<Policy>;
    transaction?: OnyxEntry<Transaction>;
    includePolicyReportFieldOptions?: boolean;
    policyReportFieldOptions?: string[];
    recentlyUsedPolicyReportFieldOptions?: string[];
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    includeInvoiceRooms?: boolean;
    includeDomainEmail?: boolean;
    action?: IOUAction;
    shouldBoldTitleByDefault?: boolean;
};

type GetUserToInviteConfig = {
    searchValue: string;
    excludeUnknownUsers?: boolean;
    optionsToExclude?: Array<Partial<ReportUtils.OptionData>>;
    selectedOptions?: Array<Partial<ReportUtils.OptionData>>;
    reportActions?: ReportActions;
    showChatPreviewLine?: boolean;
};

type MemberForList = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    isDisabled: boolean;
    accountID?: number;
    login: string;
    icons?: OnyxCommon.Icon[];
    pendingAction?: OnyxCommon.PendingAction;
    reportID: string;
};

type SectionForSearchTerm = {
    section: CategorySection;
};
type Options = {
    recentReports: ReportUtils.OptionData[];
    personalDetails: ReportUtils.OptionData[];
    userToInvite: ReportUtils.OptionData | null;
    currentUserOption: ReportUtils.OptionData | null | undefined;
    categoryOptions: CategoryTreeSection[];
    tagOptions: CategorySection[];
    taxRatesOptions: CategorySection[];
    policyReportFieldOptions?: CategorySection[] | null;
};

type PreviewConfig = {showChatPreviewLine?: boolean; forcePolicyNamePreview?: boolean; showPersonalDetails?: boolean};

type FilterOptionsConfig = Pick<GetOptionsConfig, 'sortByReportTypeInSearch' | 'canInviteUser' | 'selectedOptions' | 'excludeUnknownUsers' | 'excludeLogins' | 'maxRecentReportsToShow'> & {
    preferChatroomsOverThreads?: boolean;
    preferPolicyExpenseChat?: boolean;
    preferRecentExpenseReports?: boolean;
};

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */
let currentUserLogin: string | undefined;
let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserLogin = value?.email;
        currentUserAccountID = value?.accountID;
    },
});

let loginList: OnyxEntry<Login>;
Onyx.connect({
    key: ONYXKEYS.LOGIN_LIST,
    callback: (value) => (loginList = isEmptyObject(value) ? {} : value),
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = isEmptyObject(value) ? {} : value),
});

let preferredLocale: DeepValueOf<typeof CONST.LOCALES> = CONST.LOCALES.DEFAULT;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (value) => {
        if (!value) {
            return;
        }
        preferredLocale = value;
    },
});

const policies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (policy, key) => {
        if (!policy || !key || !policy.name) {
            return;
        }

        policies[key] = policy;
    },
});

let allPolicyCategories: OnyxCollection<PolicyCategories> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (val) => (allPolicyCategories = val),
});

const lastReportActions: ReportActions = {};
const allSortedReportActions: Record<string, ReportAction[]> = {};
let allReportActions: OnyxCollection<ReportActions>;
const lastVisibleReportActions: ReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }

        allReportActions = actions ?? {};

        // Iterate over the report actions to build the sorted and lastVisible report actions objects
        Object.entries(allReportActions).forEach((reportActions) => {
            const reportID = reportActions[0].split('_').at(1);
            if (!reportID) {
                return;
            }

            const reportActionsArray = Object.values(reportActions[1] ?? {});
            let sortedReportActions = ReportActionUtils.getSortedReportActions(reportActionsArray, true);
            allSortedReportActions[reportID] = sortedReportActions;

            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            const transactionThreadReportID = ReportActionUtils.getOneTransactionThreadReportID(reportID, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
                sortedReportActions = ReportActionUtils.getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID, false);
            }

            const firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                return;
            }

            lastReportActions[reportID] = firstReportAction;

            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            const reportActionsForDisplay = sortedReportActions.filter(
                (reportAction, actionKey) =>
                    ReportActionUtils.shouldReportActionBeVisible(reportAction, actionKey) &&
                    !ReportActionUtils.isWhisperAction(reportAction) &&
                    reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                    !ReportActionUtils.isResolvedActionTrackExpense(reportAction),
            );
            const reportActionForDisplay = reportActionsForDisplay.at(0);
            if (!reportActionForDisplay) {
                return;
            }
            lastVisibleReportActions[reportID] = reportActionForDisplay;
        });
    },
});

let allTransactions: OnyxCollection<Transaction> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }

        allTransactions = Object.keys(value)
            .filter((key) => !!value[key])
            .reduce((result: OnyxCollection<Transaction>, key) => {
                if (result) {
                    // eslint-disable-next-line no-param-reassign
                    result[key] = value[key];
                }
                return result;
            }, {});
    },
});
let activePolicyID: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => (activePolicyID = value),
});

/**
 * @param defaultValues {login: accountID} In workspace invite page, when new user is added we pass available data to opt in
 * @returns Returns avatar data for a list of user accountIDs
 */
function getAvatarsForAccountIDs(accountIDs: number[], personalDetails: OnyxEntry<PersonalDetailsList>, defaultValues: Record<string, number> = {}): OnyxCommon.Icon[] {
    const reversedDefaultValues: Record<number, string> = {};

    Object.entries(defaultValues).forEach((item) => {
        reversedDefaultValues[item[1]] = item[0];
    });

    return accountIDs.map((accountID) => {
        const login = reversedDefaultValues[accountID] ?? '';
        const userPersonalDetail = personalDetails?.[accountID] ?? {login, accountID};

        return {
            id: accountID,
            source: userPersonalDetail.avatar ?? FallbackAvatar,
            type: CONST.ICON_TYPE_AVATAR,
            name: userPersonalDetail.login ?? '',
        };
    });
}

/**
 * Returns the personal details for an array of accountIDs
 * @returns keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs: number[] | undefined, personalDetails: OnyxInputOrEntry<PersonalDetailsList>): SetNonNullable<PersonalDetailsList> {
    const personalDetailsForAccountIDs: SetNonNullable<PersonalDetailsList> = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    accountIDs?.forEach((accountID) => {
        const cleanAccountID = Number(accountID);
        if (!cleanAccountID) {
            return;
        }
        let personalDetail: OnyxEntry<PersonalDetails> = personalDetails[accountID] ?? undefined;
        if (!personalDetail) {
            personalDetail = {} as PersonalDetails;
        }

        if (cleanAccountID === CONST.ACCOUNT_ID.CONCIERGE) {
            personalDetail.avatar = CONST.CONCIERGE_ICON_URL;
        }

        personalDetail.accountID = cleanAccountID;
        personalDetailsForAccountIDs[cleanAccountID] = personalDetail;
    });
    return personalDetailsForAccountIDs;
}

/**
 * Return true if personal details data is ready, i.e. report list options can be created.
 */
function isPersonalDetailsReady(personalDetails: OnyxEntry<PersonalDetailsList>): boolean {
    const personalDetailsKeys = Object.keys(personalDetails ?? {});
    return personalDetailsKeys.some((key) => personalDetails?.[key]?.accountID);
}

/**
 * Get the participant option for a report.
 */
function getParticipantsOption(participant: ReportUtils.OptionData | Participant, personalDetails: OnyxEntry<PersonalDetailsList>): Participant {
    const detail = getPersonalDetailsForAccountIDs([participant.accountID ?? -1], personalDetails)[participant.accountID ?? -1];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const login = detail?.login || participant.login || '';
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(detail, LocalePhoneNumber.formatPhoneNumber(login));

    return {
        keyForList: String(detail?.accountID),
        login,
        accountID: detail?.accountID ?? -1,
        text: displayName,
        firstName: detail?.firstName ?? '',
        lastName: detail?.lastName ?? '',
        alternateText: LocalePhoneNumber.formatPhoneNumber(login) || displayName,
        icons: [
            {
                source: detail?.avatar ?? FallbackAvatar,
                name: login,
                type: CONST.ICON_TYPE_AVATAR,
                id: detail?.accountID,
            },
        ],
        phoneNumber: detail?.phoneNumber ?? '',
        selected: participant.selected,
        isSelected: participant.selected,
        searchText: participant.searchText ?? undefined,
    };
}

/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 */
function uniqFast(items: string[]): string[] {
    const seenItems: Record<string, number> = {};
    const result: string[] = [];
    let j = 0;

    for (const item of items) {
        if (seenItems[item] !== 1) {
            seenItems[item] = 1;
            result[j++] = item;
        }
    }

    return result;
}

/**
 * Get an object of error messages keyed by microtime by combining all error objects related to the report.
 */
function getAllReportErrors(report: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>): OnyxCommon.Errors {
    const reportErrors = report?.errors ?? {};
    const reportErrorFields = report?.errorFields ?? {};
    const reportActionsArray = Object.values(reportActions ?? {});
    const reportActionErrors: OnyxCommon.ErrorFields = {};

    for (const action of reportActionsArray) {
        if (action && !isEmptyObject(action.errors)) {
            Object.assign(reportActionErrors, action.errors);
        }
    }
    const parentReportAction: OnyxEntry<ReportAction> =
        !report?.parentReportID || !report?.parentReportActionID ? undefined : allReportActions?.[report.parentReportID ?? '-1']?.[report.parentReportActionID ?? '-1'];

    if (ReportActionUtils.wasActionTakenByCurrentUser(parentReportAction) && ReportActionUtils.isTransactionThread(parentReportAction)) {
        const transactionID = ReportActionUtils.isMoneyRequestAction(parentReportAction) ? ReportActionUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID : null;
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (TransactionUtils.hasMissingSmartscanFields(transaction ?? null) && !ReportUtils.isSettled(transaction?.reportID)) {
            reportActionErrors.smartscan = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericSmartscanFailureMessage');
        }
    } else if ((ReportUtils.isIOUReport(report) || ReportUtils.isExpenseReport(report)) && report?.ownerAccountID === currentUserAccountID) {
        if (ReportUtils.shouldShowRBRForMissingSmartscanFields(report?.reportID ?? '-1') && !ReportUtils.isSettled(report?.reportID)) {
            reportActionErrors.smartscan = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericSmartscanFailureMessage');
        }
    } else if (ReportUtils.hasSmartscanError(reportActionsArray)) {
        reportActionErrors.smartscan = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericSmartscanFailureMessage');
    }
    // All error objects related to the report. Each object in the sources contains error messages keyed by microtime
    const errorSources = {
        reportErrors,
        ...reportErrorFields,
        ...reportActionErrors,
    };

    // Combine all error messages keyed by microtime into one object
    const errorSourcesArray = Object.values(errorSources ?? {});
    const allReportErrors = {};

    for (const errors of errorSourcesArray) {
        if (!isEmptyObject(errors)) {
            Object.assign(allReportErrors, errors);
        }
    }
    return allReportErrors;
}

/**
 * Get the last actor display name from last actor details.
 */
function getLastActorDisplayName(lastActorDetails: Partial<PersonalDetails> | null, hasMultipleParticipants: boolean) {
    return hasMultipleParticipants && lastActorDetails && lastActorDetails.accountID !== currentUserAccountID
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          lastActorDetails.firstName || PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails)
        : '';
}

/**
 * Update alternate text for the option when applicable
 */
function getAlternateText(option: ReportUtils.OptionData, {showChatPreviewLine = false, forcePolicyNamePreview = false}: PreviewConfig) {
    const report = ReportUtils.getReportOrDraftReport(option.reportID);
    const isAdminRoom = ReportUtils.isAdminRoom(report);
    const isAnnounceRoom = ReportUtils.isAnnounceRoom(report);
    const isGroupChat = ReportUtils.isGroupChat(report);
    const isExpenseThread = ReportUtils.isMoneyRequest(report);

    if (isExpenseThread || option.isMoneyRequestReport) {
        return showChatPreviewLine && option.lastMessageText ? option.lastMessageText : Localize.translate(preferredLocale, 'iou.expense');
    }

    if (option.isThread) {
        return showChatPreviewLine && option.lastMessageText ? option.lastMessageText : Localize.translate(preferredLocale, 'threads.thread');
    }

    if (option.isChatRoom && !isAdminRoom && !isAnnounceRoom) {
        return showChatPreviewLine && option.lastMessageText ? option.lastMessageText : option.subtitle;
    }

    if ((option.isPolicyExpenseChat ?? false) || isAdminRoom || isAnnounceRoom) {
        return showChatPreviewLine && !forcePolicyNamePreview && option.lastMessageText ? option.lastMessageText : option.subtitle;
    }

    if (option.isTaskReport) {
        return showChatPreviewLine && option.lastMessageText ? option.lastMessageText : Localize.translate(preferredLocale, 'task.task');
    }

    if (isGroupChat) {
        return showChatPreviewLine && option.lastMessageText ? option.lastMessageText : Localize.translate(preferredLocale, 'common.group');
    }

    return showChatPreviewLine && option.lastMessageText
        ? option.lastMessageText
        : LocalePhoneNumber.formatPhoneNumber(option.participantsList && option.participantsList.length > 0 ? option.participantsList.at(0)?.login ?? '' : '');
}

function isSearchStringMatchUserDetails(personalDetail: PersonalDetails, searchValue: string) {
    let memberDetails = '';
    if (personalDetail.login) {
        memberDetails += ` ${personalDetail.login}`;
    }
    if (personalDetail.firstName) {
        memberDetails += ` ${personalDetail.firstName}`;
    }
    if (personalDetail.lastName) {
        memberDetails += ` ${personalDetail.lastName}`;
    }
    if (personalDetail.displayName) {
        memberDetails += ` ${PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail)}`;
    }
    if (personalDetail.phoneNumber) {
        memberDetails += ` ${personalDetail.phoneNumber}`;
    }
    return isSearchStringMatch(searchValue.trim(), memberDetails.toLowerCase());
}

/**
 * Get IOU report ID of report last action if the action is report action preview
 */
function getIOUReportIDOfLastAction(report: OnyxEntry<Report>): string | undefined {
    if (!report?.reportID) {
        return;
    }
    const lastAction = lastVisibleReportActions[report.reportID];
    if (!ReportActionUtils.isReportPreviewAction(lastAction)) {
        return;
    }
    return ReportUtils.getReportOrDraftReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastAction))?.reportID;
}

/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport(report: OnyxEntry<Report>, lastActorDetails: Partial<PersonalDetails> | null, policy?: OnyxEntry<Policy>): string {
    const reportID = report?.reportID ?? '-1';
    const lastReportAction = lastVisibleReportActions[reportID] ?? null;

    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    const lastOriginalReportAction = lastReportActions[reportID] ?? null;
    let lastMessageTextFromReport = '';

    if (report?.private_isArchived) {
        const archiveReason =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (ReportActionUtils.isClosedAction(lastOriginalReportAction) && ReportActionUtils.getOriginalMessage(lastOriginalReportAction)?.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails),
                    policyName: ReportUtils.getPolicyName(report, false, policy),
                });
                break;
            }
            case CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`);
                break;
            }
            default: {
                lastMessageTextFromReport = Localize.translate(preferredLocale, `reportArchiveReasons.default`);
            }
        }
    } else if (ReportActionUtils.isMoneyRequestAction(lastReportAction)) {
        const properSchemaForMoneyRequestMessage = ReportUtils.getReportPreviewMessage(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForMoneyRequestMessage);
    } else if (ReportActionUtils.isReportPreviewAction(lastReportAction)) {
        const iouReport = ReportUtils.getReportOrDraftReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastReportAction));
        const lastIOUMoneyReportAction = allSortedReportActions[iouReport?.reportID ?? '-1']?.find(
            (reportAction, key): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                ReportActionUtils.shouldReportActionBeVisible(reportAction, key) &&
                reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                ReportActionUtils.isMoneyRequestAction(reportAction),
        );
        const reportPreviewMessage = ReportUtils.getReportPreviewMessage(
            !isEmptyObject(iouReport) ? iouReport : null,
            lastIOUMoneyReportAction,
            true,
            ReportUtils.isChatReport(report),
            null,
            true,
            lastReportAction,
        );
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(reportPreviewMessage);
    } else if (ReportActionUtils.isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getReimbursementQueuedActionMessage(lastReportAction, report);
    } else if (ReportActionUtils.isReimbursementDeQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getReimbursementDeQueuedActionMessage(lastReportAction, report, true);
    } else if (ReportActionUtils.isDeletedParentAction(lastReportAction) && ReportUtils.isChatReport(report)) {
        lastMessageTextFromReport = ReportUtils.getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (ReportActionUtils.isPendingRemove(lastReportAction) && ReportActionUtils.isThreadParentMessage(lastReportAction, report?.reportID ?? '-1')) {
        lastMessageTextFromReport = Localize.translateLocal('parentReportAction.hiddenMessage');
    } else if (ReportUtils.isReportMessageAttachment({text: report?.lastMessageText ?? '-1', html: report?.lastMessageHtml, translationKey: report?.lastMessageTranslationKey, type: ''})) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        lastMessageTextFromReport = `[${Localize.translateLocal((report?.lastMessageTranslationKey || 'common.attachment') as TranslationPaths)}]`;
    } else if (ReportActionUtils.isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = ModifiedExpenseMessage.getForReportAction(report?.reportID, lastReportAction);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (ReportActionUtils.isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(TaskUtils.getTaskReportActionMessage(lastReportAction).text);
    } else if (ReportActionUtils.isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = TaskUtils.getTaskCreatedMessage(lastReportAction);
    } else if (
        ReportActionUtils.isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        ReportActionUtils.isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)
    ) {
        const wasSubmittedViaHarvesting = ReportActionUtils.getOriginalMessage(lastReportAction)?.harvesting ?? false;
        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = ReportUtils.getReportAutomaticallySubmittedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = ReportUtils.getIOUSubmittedMessage(lastReportAction);
        }
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.APPROVED) {
        lastMessageTextFromReport = ReportUtils.getIOUApprovedMessage(lastReportAction);
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.FORWARDED) {
        lastMessageTextFromReport = ReportUtils.getIOUForwardedMessage(lastReportAction, report);
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = ReportUtils.getRejectedReportMessage();
    } else if (ReportActionUtils.isActionableAddPaymentCard(lastReportAction)) {
        lastMessageTextFromReport = ReportActionUtils.getReportActionMessageText(lastReportAction);
    } else if (lastReportAction?.actionName === 'EXPORTINTEGRATION') {
        lastMessageTextFromReport = ReportActionUtils.getExportIntegrationLastMessageText(lastReportAction);
    } else if (lastReportAction?.actionName && ReportActionUtils.isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = ReportActionUtils.getMessageOfOldDotReportAction(lastReportAction, false);
    }

    return lastMessageTextFromReport || (report?.lastMessageText ?? '');
}

/**
 * Creates a report list option
 */
function createOption(
    accountIDs: number[],
    personalDetails: OnyxInputOrEntry<PersonalDetailsList>,
    report: OnyxInputOrEntry<Report>,
    reportActions: ReportActions,
    config?: PreviewConfig,
): ReportUtils.OptionData {
    const {showChatPreviewLine = false, forcePolicyNamePreview = false, showPersonalDetails = false} = config ?? {};
    const result: ReportUtils.OptionData = {
        text: undefined,
        alternateText: undefined,
        pendingAction: undefined,
        allReportErrors: undefined,
        brickRoadIndicator: null,
        icons: undefined,
        tooltipText: null,
        ownerAccountID: undefined,
        subtitle: undefined,
        participantsList: undefined,
        accountID: 0,
        login: undefined,
        reportID: '',
        phoneNumber: undefined,
        hasDraftComment: false,
        keyForList: undefined,
        isDefaultRoom: false,
        isPinned: false,
        isWaitingOnBankAccount: false,
        iouReportID: undefined,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isOwnPolicyExpenseChat: false,
        isExpenseReport: false,
        policyID: undefined,
        isOptimisticPersonalDetail: false,
        lastMessageText: '',
    };

    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = Object.values(personalDetailMap).filter((details): details is PersonalDetails => !!details);
    const personalDetail = personalDetailList.at(0);
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;
    result.participantsList = personalDetailList;
    result.isOptimisticPersonalDetail = personalDetail?.isOptimisticPersonalDetail;
    if (report) {
        result.isChatRoom = ReportUtils.isChatRoom(report);
        result.isDefaultRoom = ReportUtils.isDefaultRoom(report);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        result.private_isArchived = report.private_isArchived;
        result.isExpenseReport = ReportUtils.isExpenseReport(report);
        result.isInvoiceRoom = ReportUtils.isInvoiceRoom(report);
        result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        result.isThread = ReportUtils.isChatThread(report);
        result.isTaskReport = ReportUtils.isTaskReport(report);
        result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
        result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        result.isOwnPolicyExpenseChat = report.isOwnPolicyExpenseChat ?? false;
        result.allReportErrors = getAllReportErrors(report, reportActions);
        result.brickRoadIndicator = !isEmptyObject(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom ?? report.pendingFields.createChat : undefined;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        result.isUnread = ReportUtils.isUnread(report);
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;
        result.isSelfDM = ReportUtils.isSelfDM(report);
        result.notificationPreference = ReportUtils.getReportNotificationPreference(report);

        const visibleParticipantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report, true);

        result.tooltipText = ReportUtils.getReportParticipantsTitle(visibleParticipantAccountIDs);

        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || ReportUtils.isGroupChat(report);
        subtitle = ReportUtils.getChatRoomSubtitle(report);

        const lastActorDetails = personalDetailMap[report.lastActorAccountID ?? -1] ?? null;
        const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, hasMultipleParticipants);
        const lastMessageTextFromReport = getLastMessageTextForReport(report, lastActorDetails);
        let lastMessageText = lastMessageTextFromReport;

        const lastAction = lastVisibleReportActions[report.reportID];
        const shouldDisplayLastActorName = lastAction && lastAction.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU;

        if (shouldDisplayLastActorName && lastActorDisplayName && lastMessageTextFromReport) {
            lastMessageText = `${lastActorDisplayName}: ${lastMessageTextFromReport}`;
        }

        result.lastMessageText = lastMessageText;

        // If displaying chat preview line is needed, let's overwrite the default alternate text
        result.alternateText = showPersonalDetails && personalDetail?.login ? personalDetail.login : getAlternateText(result, {showChatPreviewLine, forcePolicyNamePreview});

        reportName = showPersonalDetails
            ? ReportUtils.getDisplayNameForParticipant(accountIDs.at(0)) || LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '')
            : ReportUtils.getReportName(report);
    } else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName = ReportUtils.getDisplayNameForParticipant(accountIDs.at(0)) || LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '');
        result.keyForList = String(accountIDs.at(0));

        result.alternateText = LocalePhoneNumber.formatPhoneNumber(personalDetails?.[accountIDs[0]]?.login ?? '');
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils.getMoneyRequestSpendBreakdown(result).totalDisplaySpend;

    if (!hasMultipleParticipants && (!report || (report && !ReportUtils.isGroupChat(report) && !ReportUtils.isChatRoom(report)))) {
        result.login = personalDetail?.login;
        result.accountID = Number(personalDetail?.accountID);
        result.phoneNumber = personalDetail?.phoneNumber;
    }

    result.text = reportName;
    result.icons = ReportUtils.getIcons(report, personalDetails, personalDetail?.avatar, personalDetail?.login, personalDetail?.accountID, null);
    result.subtitle = subtitle;

    return result;
}

/**
 * Get the option for a given report.
 */
function getReportOption(participant: Participant): ReportUtils.OptionData {
    const report = ReportUtils.getReportOrDraftReport(participant.reportID);
    const visibleParticipantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report, true);

    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails ?? {},
        !isEmptyObject(report) ? report : undefined,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = Localize.translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = ReportUtils.getReportName(report);
        option.alternateText = Localize.translateLocal('workspace.common.invoices');
    } else {
        option.text = ReportUtils.getPolicyName(report);
        option.alternateText = Localize.translateLocal('workspace.common.workspace');
    }
    option.isDisabled = ReportUtils.isDraftReport(participant.reportID);
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}

/**
 * Get the display option for a given report.
 */
function getReportDisplayOption(report: OnyxEntry<Report>): ReportUtils.OptionData {
    const visibleParticipantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report, true);

    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails ?? {},
        !isEmptyObject(report) ? report : undefined,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = Localize.translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = ReportUtils.getReportName(report);
        option.alternateText = Localize.translateLocal('workspace.common.invoices');
    } else {
        option.text = ReportUtils.getPolicyName(report);
        option.alternateText = Localize.translateLocal('workspace.common.workspace');
    }
    option.isDisabled = true;
    option.selected = false;
    option.isSelected = false;
    return option;
}

/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(participant: Participant | ReportUtils.OptionData): ReportUtils.OptionData {
    const expenseReport = ReportUtils.isPolicyExpenseChat(participant) ? ReportUtils.getReportOrDraftReport(participant.reportID) : null;

    const visibleParticipantAccountIDs = Object.entries(expenseReport?.participants ?? {})
        .filter(([, reportParticipant]) => reportParticipant && reportParticipant.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN)
        .map(([accountID]) => Number(accountID));

    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails ?? {},
        !isEmptyObject(expenseReport) ? expenseReport : null,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = ReportUtils.getPolicyName(expenseReport);
    option.alternateText = Localize.translateLocal('workspace.common.workspace');
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}

/**
 * Searches for a match when provided with a value
 */
function isSearchStringMatch(searchValue: string, searchText?: string | null, participantNames = new Set<string>(), isChatRoom = false): boolean {
    const searchWords = new Set(searchValue.replace(/,/g, ' ').split(' '));
    const valueToSearch = searchText?.replace(new RegExp(/&nbsp;/g), '');
    let matching = true;
    searchWords.forEach((word) => {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            return;
        }
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch ?? '') || (!isChatRoom && participantNames.has(word));
    });
    return matching;
}

/**
 * Checks if the given userDetails is currentUser or not.
 * Note: We can't migrate this off of using logins because this is used to check if you're trying to start a chat with
 * yourself or a different user, and people won't be starting new chats via accountID usually.
 */
function isCurrentUser(userDetails: PersonalDetails): boolean {
    if (!userDetails) {
        return false;
    }

    // If user login is a mobile number, append sms domain if not appended already.
    const userDetailsLogin = PhoneNumber.addSMSDomainIfPhoneNumber(userDetails.login ?? '');

    if (currentUserLogin?.toLowerCase() === userDetailsLogin.toLowerCase()) {
        return true;
    }

    // Check if userDetails login exists in loginList
    return Object.keys(loginList ?? {}).some((login) => login.toLowerCase() === userDetailsLogin.toLowerCase());
}

/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(options: PolicyCategories): number {
    return Object.values(options).filter((option) => option.enabled).length;
}

function getSearchValueForPhoneOrEmail(searchTerm: string) {
    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchTerm)));
    return parsedPhoneNumber.possible ? parsedPhoneNumber.number?.e164 ?? '' : searchTerm.toLowerCase();
}

/**
 * Verifies that there is at least one enabled option
 */
function hasEnabledOptions(options: PolicyCategories | PolicyTag[]): boolean {
    return Object.values(options).some((option: PolicyTag | PolicyCategory) => option.enabled && option.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/**
 * Sorts categories using a simple object.
 * It builds an hierarchy (based on an object), where each category has a name and other keys as subcategories.
 * Via the hierarchy we avoid duplicating and sort categories one by one. Subcategories are being sorted alphabetically.
 */
function sortCategories(categories: Record<string, Category>): Category[] {
    // Sorts categories alphabetically by name.
    const sortedCategories = Object.values(categories).sort((a, b) => a.name.localeCompare(b.name));

    // An object that respects nesting of categories. Also, can contain only uniq categories.
    const hierarchy: Hierarchy = {};
    /**
     * Iterates over all categories to set each category in a proper place in hierarchy
     * It gets a path based on a category name e.g. "Parent: Child: Subcategory" -> "Parent.Child.Subcategory".
     * {
     *   Parent: {
     *     name: "Parent",
     *     Child: {
     *       name: "Child"
     *       Subcategory: {
     *         name: "Subcategory"
     *       }
     *     }
     *   }
     * }
     */
    sortedCategories.forEach((category) => {
        const path = category.name.split(CONST.PARENT_CHILD_SEPARATOR);
        const existedValue = lodashGet(hierarchy, path, {}) as Hierarchy;
        lodashSet(hierarchy, path, {
            ...existedValue,
            name: category.name,
            pendingAction: category.pendingAction,
        });
    });

    /**
     * A recursive function to convert hierarchy into an array of category objects.
     * The category object contains base 2 properties: "name" and "enabled".
     * It iterates each key one by one. When a category has subcategories, goes deeper into them. Also, sorts subcategories alphabetically.
     */
    const flatHierarchy = (initialHierarchy: Hierarchy) =>
        Object.values(initialHierarchy).reduce((acc: Category[], category) => {
            const {name, pendingAction, ...subcategories} = category;
            if (name) {
                const categoryObject: Category = {
                    name,
                    pendingAction,
                    enabled: categories[name]?.enabled ?? false,
                };

                acc.push(categoryObject);
            }

            if (!isEmptyObject(subcategories)) {
                const nestedCategories = flatHierarchy(subcategories);

                acc.push(...nestedCategories.sort((a, b) => a.name.localeCompare(b.name)));
            }

            return acc;
        }, []);

    return flatHierarchy(hierarchy);
}

/**
 * Sorts tags alphabetically by name.
 */
function sortTags(tags: Record<string, PolicyTag | SelectedTagOption> | Array<PolicyTag | SelectedTagOption>) {
    const sortedTags = Array.isArray(tags) ? tags : Object.values(tags);

    // Use lodash's sortBy to ensure consistency with oldDot.
    return lodashSortBy(sortedTags, 'name', localeCompare);
}

/**
 * Builds the options for the category tree hierarchy via indents
 *
 * @param options - an initial object array
 * @param options[].enabled - a flag to enable/disable option in a list
 * @param options[].name - a name of an option
 * @param [isOneLine] - a flag to determine if text should be one line
 */
function getCategoryOptionTree(options: Record<string, Category> | Category[], isOneLine = false, selectedOptions: Category[] = []): OptionTree[] {
    const optionCollection = new Map<string, OptionTree>();
    Object.values(options).forEach((option) => {
        if (isOneLine) {
            if (optionCollection.has(option.name)) {
                return;
            }

            optionCollection.set(option.name, {
                text: option.name,
                keyForList: option.name,
                searchText: option.name,
                tooltipText: option.name,
                isDisabled: !option.enabled || option.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                isSelected: !!option.isSelected,
                pendingAction: option.pendingAction,
            });

            return;
        }

        option.name.split(CONST.PARENT_CHILD_SEPARATOR).forEach((optionName, index, array) => {
            const indents = times(index, () => CONST.INDENTS).join('');
            const isChild = array.length - 1 === index;
            const searchText = array.slice(0, index + 1).join(CONST.PARENT_CHILD_SEPARATOR);
            const selectedParentOption = !isChild && Object.values(selectedOptions).find((op) => op.name === searchText);
            const isParentOptionDisabled = !selectedParentOption || !selectedParentOption.enabled || selectedParentOption.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (optionCollection.has(searchText)) {
                return;
            }

            optionCollection.set(searchText, {
                text: `${indents}${optionName}`,
                keyForList: searchText,
                searchText,
                tooltipText: optionName,
                isDisabled: isChild ? !option.enabled || option.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : isParentOptionDisabled,
                isSelected: isChild ? !!option.isSelected : !!selectedParentOption,
                pendingAction: option.pendingAction,
            });
        });
    });

    return Array.from(optionCollection.values());
}

/**
 * Builds the section list for categories
 */
function getCategoryListSections(
    categories: PolicyCategories,
    recentlyUsedCategories: string[],
    selectedOptions: Category[],
    searchInputValue: string,
    maxRecentReportsToShow: number,
): CategoryTreeSection[] {
    const sortedCategories = sortCategories(categories);
    const enabledCategories = Object.values(sortedCategories).filter((category) => category.enabled);
    const enabledCategoriesNames = enabledCategories.map((category) => category.name);
    const selectedOptionsWithDisabledState: Category[] = [];
    const categorySections: CategoryTreeSection[] = [];
    const numberOfEnabledCategories = enabledCategories.length;

    selectedOptions.forEach((option) => {
        if (enabledCategoriesNames.includes(option.name)) {
            const categoryObj = enabledCategories.find((category) => category.name === option.name);
            selectedOptionsWithDisabledState.push({...(categoryObj ?? option), isSelected: true, enabled: true});
            return;
        }
        selectedOptionsWithDisabledState.push({...option, isSelected: true, enabled: false});
    });

    if (numberOfEnabledCategories === 0 && selectedOptions.length > 0) {
        const data = getCategoryOptionTree(selectedOptionsWithDisabledState, true);
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });

        return categorySections;
    }

    if (searchInputValue) {
        const categoriesForSearch = [...selectedOptionsWithDisabledState, ...enabledCategories];
        const searchCategories: Category[] = [];

        categoriesForSearch.forEach((category) => {
            if (!category.name.toLowerCase().includes(searchInputValue.toLowerCase())) {
                return;
            }
            searchCategories.push({
                ...category,
                isSelected: selectedOptions.some((selectedOption) => selectedOption.name === category.name),
            });
        });

        const data = getCategoryOptionTree(searchCategories, true);
        categorySections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data,
            indexOffset: data.length,
        });

        return categorySections;
    }

    if (selectedOptions.length > 0) {
        const data = getCategoryOptionTree(selectedOptionsWithDisabledState, true);
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });
    }

    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.name);
    const filteredCategories = enabledCategories.filter((category) => !selectedOptionNames.includes(category.name));

    if (numberOfEnabledCategories < CONST.CATEGORY_LIST_THRESHOLD) {
        const data = getCategoryOptionTree(filteredCategories, false, selectedOptionsWithDisabledState);
        categorySections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });

        return categorySections;
    }

    const filteredRecentlyUsedCategories = recentlyUsedCategories
        .filter(
            (categoryName) =>
                !selectedOptionNames.includes(categoryName) && categories[categoryName]?.enabled && categories[categoryName]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        )
        .map((categoryName) => ({
            name: categoryName,
            enabled: categories[categoryName].enabled ?? false,
        }));

    if (filteredRecentlyUsedCategories.length > 0) {
        const cutRecentlyUsedCategories = filteredRecentlyUsedCategories.slice(0, maxRecentReportsToShow);

        const data = getCategoryOptionTree(cutRecentlyUsedCategories, true);
        categorySections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            data,
            indexOffset: data.length,
        });
    }

    const data = getCategoryOptionTree(filteredCategories, false, selectedOptionsWithDisabledState);
    categorySections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        data,
        indexOffset: data.length,
    });

    return categorySections;
}

/**
 * Transforms the provided tags into option objects.
 *
 * @param tags - an initial tag array
 */
function getTagsOptions(tags: Array<Pick<PolicyTag, 'name' | 'enabled' | 'pendingAction'>>, selectedOptions?: SelectedTagOption[]): Option[] {
    return tags.map((tag) => {
        // This is to remove unnecessary escaping backslash in tag name sent from backend.
        const cleanedName = PolicyUtils.getCleanedTagName(tag.name);
        return {
            text: cleanedName,
            keyForList: tag.name,
            searchText: tag.name,
            tooltipText: cleanedName,
            isDisabled: !tag.enabled || tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            isSelected: selectedOptions?.some((selectedTag) => selectedTag.name === tag.name),
            pendingAction: tag.pendingAction,
        };
    });
}

/**
 * Build the section list for tags
 */
function getTagListSections(
    tags: Array<PolicyTag | SelectedTagOption>,
    recentlyUsedTags: string[],
    selectedOptions: SelectedTagOption[],
    searchInputValue: string,
    maxRecentReportsToShow: number,
) {
    const tagSections = [];
    const sortedTags = sortTags(tags) as PolicyTag[];
    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.name);
    const enabledTags = sortedTags.filter((tag) => tag.enabled);
    const enabledTagsNames = enabledTags.map((tag) => tag.name);
    const enabledTagsWithoutSelectedOptions = enabledTags.filter((tag) => !selectedOptionNames.includes(tag.name));
    const selectedTagsWithDisabledState: SelectedTagOption[] = [];
    const numberOfTags = enabledTags.length;

    selectedOptions.forEach((tag) => {
        if (enabledTagsNames.includes(tag.name)) {
            selectedTagsWithDisabledState.push({...tag, enabled: true});
            return;
        }
        selectedTagsWithDisabledState.push({...tag, enabled: false});
    });

    // If all tags are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTags === 0 && selectedOptions.length > 0) {
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });

        return tagSections;
    }

    if (searchInputValue) {
        const enabledSearchTags = enabledTagsWithoutSelectedOptions.filter((tag) => PolicyUtils.getCleanedTagName(tag.name.toLowerCase()).includes(searchInputValue.toLowerCase()));
        const selectedSearchTags = selectedTagsWithDisabledState.filter((tag) => PolicyUtils.getCleanedTagName(tag.name.toLowerCase()).includes(searchInputValue.toLowerCase()));
        const tagsForSearch = [...selectedSearchTags, ...enabledSearchTags];

        tagSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: getTagsOptions(tagsForSearch, selectedOptions),
        });

        return tagSections;
    }

    if (numberOfTags < CONST.TAG_LIST_THRESHOLD) {
        tagSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: getTagsOptions([...selectedTagsWithDisabledState, ...enabledTagsWithoutSelectedOptions], selectedOptions),
        });

        return tagSections;
    }

    const filteredRecentlyUsedTags = recentlyUsedTags
        .filter((recentlyUsedTag) => {
            const tagObject = tags.find((tag) => tag.name === recentlyUsedTag);
            return !!tagObject?.enabled && !selectedOptionNames.includes(recentlyUsedTag) && tagObject?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        })
        .map((tag) => ({name: tag, enabled: true}));

    if (selectedOptions.length) {
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });
    }

    if (filteredRecentlyUsedTags.length > 0) {
        const cutRecentlyUsedTags = filteredRecentlyUsedTags.slice(0, maxRecentReportsToShow);

        tagSections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            data: getTagsOptions(cutRecentlyUsedTags, selectedOptions),
        });
    }

    tagSections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        data: getTagsOptions(enabledTagsWithoutSelectedOptions, selectedOptions),
    });

    return tagSections;
}

/**
 * Verifies that there is at least one enabled tag
 */
function hasEnabledTags(policyTagList: Array<PolicyTagLists[keyof PolicyTagLists]>) {
    const policyTagValueList = policyTagList.map(({tags}) => Object.values(tags)).flat();

    return hasEnabledOptions(policyTagValueList);
}

/**
 * Transforms the provided report field options into option objects.
 *
 * @param reportFieldOptions - an initial report field options array
 */
function getReportFieldOptions(reportFieldOptions: string[]): Option[] {
    return reportFieldOptions.map((name) => ({
        text: name,
        keyForList: name,
        searchText: name,
        tooltipText: name,
        isDisabled: false,
    }));
}

/**
 * Build the section list for report field options
 */
function getReportFieldOptionsSection(options: string[], recentlyUsedOptions: string[], selectedOptions: Array<Partial<ReportUtils.OptionData>>, searchInputValue: string) {
    const reportFieldOptionsSections = [];
    const selectedOptionKeys = selectedOptions.map(({text, keyForList, name}) => text ?? keyForList ?? name ?? '').filter((o) => !!o);
    let indexOffset = 0;

    if (searchInputValue) {
        const searchOptions = options.filter((option) => option.toLowerCase().includes(searchInputValue.toLowerCase()));

        reportFieldOptionsSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            indexOffset,
            data: getReportFieldOptions(searchOptions),
        });

        return reportFieldOptionsSections;
    }

    const filteredRecentlyUsedOptions = recentlyUsedOptions.filter((recentlyUsedOption) => !selectedOptionKeys.includes(recentlyUsedOption));
    const filteredOptions = options.filter((option) => !selectedOptionKeys.includes(option));

    if (selectedOptionKeys.length) {
        reportFieldOptionsSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            indexOffset,
            data: getReportFieldOptions(selectedOptionKeys),
        });

        indexOffset += selectedOptionKeys.length;
    }

    if (filteredRecentlyUsedOptions.length > 0) {
        reportFieldOptionsSections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            indexOffset,
            data: getReportFieldOptions(filteredRecentlyUsedOptions),
        });

        indexOffset += filteredRecentlyUsedOptions.length;
    }

    reportFieldOptionsSections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        indexOffset,
        data: getReportFieldOptions(filteredOptions),
    });

    return reportFieldOptionsSections;
}

/**
 * Sorts tax rates alphabetically by name.
 */
function sortTaxRates(taxRates: TaxRates): TaxRate[] {
    const sortedtaxRates = lodashSortBy(taxRates, (taxRate) => taxRate.name);
    return sortedtaxRates;
}

/**
 * Builds the options for taxRates
 */
function getTaxRatesOptions(taxRates: Array<Partial<TaxRate>>): TaxRatesOption[] {
    return taxRates.map(({code, modifiedName, isDisabled, isSelected, pendingAction}) => ({
        code,
        text: modifiedName,
        keyForList: modifiedName,
        searchText: modifiedName,
        tooltipText: modifiedName,
        isDisabled: !!isDisabled || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        isSelected,
        pendingAction,
    }));
}

/**
 * Builds the section list for tax rates
 */
function getTaxRatesSection(policy: OnyxEntry<Policy> | undefined, selectedOptions: Tax[], searchInputValue: string, transaction?: OnyxEntry<Transaction>): TaxSection[] {
    const policyRatesSections = [];

    const taxes = TransactionUtils.transformedTaxRates(policy, transaction);

    const sortedTaxRates = sortTaxRates(taxes);
    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.modifiedName);
    const enabledTaxRates = sortedTaxRates.filter((taxRate) => !taxRate.isDisabled);
    const enabledTaxRatesNames = enabledTaxRates.map((tax) => tax.modifiedName);
    const enabledTaxRatesWithoutSelectedOptions = enabledTaxRates.filter((tax) => tax.modifiedName && !selectedOptionNames.includes(tax.modifiedName));
    const selectedTaxRateWithDisabledState: Tax[] = [];
    const numberOfTaxRates = enabledTaxRates.length;

    selectedOptions.forEach((tax) => {
        if (enabledTaxRatesNames.includes(tax.modifiedName)) {
            selectedTaxRateWithDisabledState.push({...tax, isDisabled: false, isSelected: true});
            return;
        }
        selectedTaxRateWithDisabledState.push({...tax, isDisabled: true, isSelected: true});
    });

    // If all tax are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTaxRates === 0 && selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" sectiong
            title: '',
            shouldShow: false,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });

        return policyRatesSections;
    }

    if (searchInputValue) {
        const enabledSearchTaxRates = enabledTaxRatesWithoutSelectedOptions.filter((taxRate) => taxRate.modifiedName?.toLowerCase().includes(searchInputValue.toLowerCase()));
        const selectedSearchTags = selectedTaxRateWithDisabledState.filter((taxRate) => taxRate.modifiedName?.toLowerCase().includes(searchInputValue.toLowerCase()));
        const taxesForSearch = [...selectedSearchTags, ...enabledSearchTaxRates];

        policyRatesSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: getTaxRatesOptions(taxesForSearch),
        });

        return policyRatesSections;
    }

    if (numberOfTaxRates < CONST.TAX_RATES_LIST_THRESHOLD) {
        policyRatesSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: getTaxRatesOptions([...selectedTaxRateWithDisabledState, ...enabledTaxRatesWithoutSelectedOptions]),
        });

        return policyRatesSections;
    }

    if (selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });
    }

    policyRatesSections.push({
        // "All" section when number of items are more than the threshold
        title: '',
        shouldShow: true,
        data: getTaxRatesOptions(enabledTaxRatesWithoutSelectedOptions),
    });

    return policyRatesSections;
}

/**
 * Checks if a report option is selected based on matching accountID or reportID.
 *
 * @param reportOption - The report option to be checked.
 * @param selectedOptions - Array of selected options to compare with.
 * @returns true if the report option matches any of the selected options by accountID or reportID, false otherwise.
 */
function isReportSelected(reportOption: ReportUtils.OptionData, selectedOptions: Array<Partial<ReportUtils.OptionData>>) {
    if (!selectedOptions || selectedOptions.length === 0) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return selectedOptions.some((option) => (option.accountID && option.accountID === reportOption.accountID) || (option.reportID && option.reportID === reportOption.reportID));
}

function createOptionList(personalDetails: OnyxEntry<PersonalDetailsList>, reports?: OnyxCollection<Report>) {
    const reportMapForAccountIDs: Record<number, Report> = {};
    const allReportOptions: Array<SearchOption<Report>> = [];

    if (reports) {
        Object.values(reports).forEach((report) => {
            if (!report) {
                return;
            }

            const isOneOnOneChat = ReportUtils.isOneOnOneChat(report);
            const accountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);

            const isChatRoom = ReportUtils.isChatRoom(report);
            if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
                return;
            }

            // Save the report in the map if this is a single participant so we can associate the reportID with the
            // personal detail option later. Individuals should not be associated with single participant
            // policyExpenseChats or chatRooms since those are not people.
            if (accountIDs.length <= 1 && isOneOnOneChat) {
                reportMapForAccountIDs[accountIDs[0]] = report;
            }

            allReportOptions.push({
                item: report,
                ...createOption(accountIDs, personalDetails, report, {}),
            });
        });
    }

    const allPersonalDetailsOptions = Object.values(personalDetails ?? {}).map((personalDetail) => ({
        item: personalDetail,
        ...createOption([personalDetail?.accountID ?? -1], personalDetails, reportMapForAccountIDs[personalDetail?.accountID ?? -1], {}, {showPersonalDetails: true}),
    }));

    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions as Array<SearchOption<PersonalDetails>>,
    };
}

function createOptionFromReport(report: Report, personalDetails: OnyxEntry<PersonalDetailsList>) {
    const accountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);

    return {
        item: report,
        ...createOption(accountIDs, personalDetails, report, {}),
    };
}

/**
 * Options need to be sorted in the specific order
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderOptions(
    options: ReportUtils.OptionData[],
    searchValue: string | undefined,
    {preferChatroomsOverThreads = false, preferPolicyExpenseChat = false, preferRecentExpenseReports = false} = {},
) {
    return lodashOrderBy(
        options,
        [
            (option) => {
                if (option.isPolicyExpenseChat && preferPolicyExpenseChat && option.policyID === activePolicyID) {
                    return 0;
                }

                if (option.isSelfDM) {
                    return 0;
                }
                if (preferRecentExpenseReports && !!option?.lastIOUCreationDate) {
                    return 1;
                }
                if (preferRecentExpenseReports && option.isPolicyExpenseChat) {
                    return 1;
                }
                if (preferChatroomsOverThreads && option.isThread) {
                    return 4;
                }
                if (!!option.isChatRoom || option.private_isArchived) {
                    return 3;
                }
                if (!option.login) {
                    return 2;
                }
                if (option.login.toLowerCase() !== searchValue?.toLowerCase()) {
                    return 1;
                }

                // When option.login is an exact match with the search value, returning 0 puts it at the top of the option list
                return 0;
            },
            // For Submit Expense flow, prioritize the most recent expense reports and then policy expense chats (without expense requests)
            preferRecentExpenseReports ? (option) => option?.lastIOUCreationDate ?? '' : '',
            preferRecentExpenseReports ? (option) => option?.isPolicyExpenseChat : 0,
        ],
        ['asc', 'desc', 'desc'],
    );
}

function canCreateOptimisticPersonalDetailOption({
    searchValue,
    recentReportOptions,
    personalDetailsOptions,
    currentUserOption,
}: {
    searchValue: string;
    recentReportOptions: ReportUtils.OptionData[];
    personalDetailsOptions: ReportUtils.OptionData[];
    currentUserOption?: ReportUtils.OptionData | null;
    excludeUnknownUsers: boolean;
}) {
    const noOptions = recentReportOptions.length + personalDetailsOptions.length === 0 && !currentUserOption;
    const noOptionsMatchExactly = !personalDetailsOptions
        .concat(recentReportOptions)
        .find((option) => option.login === PhoneNumber.addSMSDomainIfPhoneNumber(searchValue ?? '').toLowerCase() || option.login === searchValue?.toLowerCase());

    return noOptions || noOptionsMatchExactly;
}

/**
 * We create a new user option if the following conditions are satisfied:
 * - There's no matching recent report and personal detail option
 * - The searchValue is a valid email or phone number
 * - The searchValue isn't the current personal detail login
 */
function getUserToInviteOption({
    searchValue,
    excludeUnknownUsers = false,
    optionsToExclude = [],
    selectedOptions = [],
    reportActions = {},
    showChatPreviewLine = false,
}: GetUserToInviteConfig): ReportUtils.OptionData | null {
    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchValue)));
    const isCurrentUserLogin = isCurrentUser({login: searchValue} as PersonalDetails);
    const isInSelectedOption = selectedOptions.some((option) => 'login' in option && option.login === searchValue);
    const isValidEmail = Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN);
    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(LoginUtils.getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));
    const isInOptionToExclude =
        optionsToExclude.findIndex((optionToExclude) => 'login' in optionToExclude && optionToExclude.login === PhoneNumber.addSMSDomainIfPhoneNumber(searchValue).toLowerCase()) !== -1;

    if (!searchValue || isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber) || isInOptionToExclude || excludeUnknownUsers) {
        return null;
    }

    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = UserUtils.generateAccountID(searchValue);
    const personalDetailsExtended = {
        ...allPersonalDetails,
        [optimisticAccountID]: {
            accountID: optimisticAccountID,
            login: searchValue,
        },
    };
    const userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, reportActions, {
        showChatPreviewLine,
    });
    userToInvite.isOptimisticAccount = true;
    userToInvite.login = searchValue;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    userToInvite.text = userToInvite.text || searchValue;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    userToInvite.alternateText = userToInvite.alternateText || searchValue;

    // If user doesn't exist, use a fallback avatar
    userToInvite.icons = [
        {
            source: FallbackAvatar,
            id: optimisticAccountID,
            name: searchValue,
            type: CONST.ICON_TYPE_AVATAR,
        },
    ];

    return userToInvite;
}

/**
 * Check whether report has violations
 */
function shouldShowViolations(report: Report, transactionViolations: OnyxCollection<TransactionViolation[]>) {
    const {parentReportID, parentReportActionID} = report ?? {};
    const canGetParentReport = parentReportID && parentReportActionID && allReportActions;
    if (!canGetParentReport) {
        return false;
    }
    const parentReportActions = allReportActions ? allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`] ?? {} : {};
    const parentReportAction = parentReportActions[parentReportActionID] ?? null;
    if (!parentReportAction) {
        return false;
    }
    return ReportUtils.shouldDisplayTransactionThreadViolations(report, transactionViolations, parentReportAction);
}

/**
 * filter options based on specific conditions
 */
function getOptions(
    options: OptionList,
    {
        reportActions = {},
        betas = [],
        selectedOptions = [],
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        includeMultipleParticipantReports = false,
        includeRecentReports = false,
        // When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well.
        sortByReportTypeInSearch = false,
        searchInputValue = '',
        showChatPreviewLine = false,
        sortPersonalDetailsByAlphaAsc = true,
        forcePolicyNamePreview = false,
        includeOwnedWorkspaceChats = false,
        includeThreads = false,
        includeTasks = false,
        includeMoneyRequests = false,
        excludeUnknownUsers = false,
        includeP2P = true,
        includeCategories = false,
        categories = {},
        recentlyUsedCategories = [],
        includeTags = false,
        tags = {},
        recentlyUsedTags = [],
        canInviteUser = true,
        includeSelectedOptions = false,
        transactionViolations = {},
        includeTaxRates,
        policy,
        transaction,
        includeSelfDM = false,
        includePolicyReportFieldOptions = false,
        policyReportFieldOptions = [],
        recentlyUsedPolicyReportFieldOptions = [],
        includeInvoiceRooms = false,
        includeDomainEmail = false,
        action,
        shouldBoldTitleByDefault = true,
    }: GetOptionsConfig,
): Options {
    if (includeCategories) {
        const categoryOptions = getCategoryListSections(categories, recentlyUsedCategories, selectedOptions as Category[], searchInputValue, maxRecentReportsToShow);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions,
            tagOptions: [],
            taxRatesOptions: [],
        };
    }

    if (includeTags) {
        const tagOptions = getTagListSections(Object.values(tags), recentlyUsedTags, selectedOptions as SelectedTagOption[], searchInputValue, maxRecentReportsToShow);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions,
            taxRatesOptions: [],
        };
    }

    if (includeTaxRates) {
        const taxRatesOptions = getTaxRatesSection(policy, selectedOptions as Tax[], searchInputValue, transaction);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions,
        };
    }

    if (includePolicyReportFieldOptions) {
        const transformedPolicyReportFieldOptions = getReportFieldOptionsSection(policyReportFieldOptions, recentlyUsedPolicyReportFieldOptions, selectedOptions, searchInputValue);
        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions: [],
            policyReportFieldOptions: transformedPolicyReportFieldOptions,
        };
    }

    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible ? parsedPhoneNumber.number?.e164 ?? '' : searchInputValue.toLowerCase();
    const topmostReportId = Navigation.getTopmostReportId() ?? '-1';

    // Filter out all the reports that shouldn't be displayed
    const filteredReportOptions = options.reports.filter((option) => {
        const report = option.item;
        const doesReportHaveViolations = shouldShowViolations(report, transactionViolations);

        return ReportUtils.shouldReportBeInOptionList({
            report,
            currentReportId: topmostReportId,
            betas,
            policies,
            doesReportHaveViolations,
            isInFocusMode: false,
            excludeEmptyChats: false,
            includeSelfDM,
            login: option.login,
            includeDomainEmail,
        });
    });

    // Sorting the reports works like this:
    // - Order everything by the last message timestamp (descending)
    // - When searching, self DM is put at the top
    // - All archived reports should remain at the bottom
    const orderedReportOptions = lodashSortBy(filteredReportOptions, (option) => {
        const report = option.item;
        if (option.private_isArchived) {
            return CONST.DATE.UNIX_EPOCH;
        }

        if (searchValue) {
            return [option.isSelfDM, report?.lastVisibleActionCreated];
        }

        return report?.lastVisibleActionCreated;
    });
    orderedReportOptions.reverse();

    const allReportOptions = orderedReportOptions.filter((option) => {
        const report = option.item;

        if (!report) {
            return;
        }

        const isThread = option.isThread;
        const isTaskReport = option.isTaskReport;
        const isPolicyExpenseChat = option.isPolicyExpenseChat;
        const isMoneyRequestReport = option.isMoneyRequestReport;
        const isSelfDM = option.isSelfDM;
        const isChatRoom = option.isChatRoom;
        const accountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);

        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            return;
        }

        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to workspace chats only.
        if (!includeP2P && !isPolicyExpenseChat) {
            return;
        }

        if (isSelfDM && !includeSelfDM) {
            return;
        }

        if (isThread && !includeThreads) {
            return;
        }

        if (isTaskReport && !includeTasks) {
            return;
        }

        if (isMoneyRequestReport && !includeMoneyRequests) {
            return;
        }

        // In case user needs to add credit bank account, don't allow them to submit an expense from the workspace.
        if (includeOwnedWorkspaceChats && ReportUtils.hasIOUWaitingOnCurrentUserBankAccount(report)) {
            return;
        }

        if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
            return;
        }

        return option;
    });

    const havingLoginPersonalDetails = includeP2P
        ? options.personalDetails.filter((detail) => !!detail?.login && !!detail.accountID && !detail?.isOptimisticPersonalDetail && (includeDomainEmail || !Str.isDomainEmail(detail.login)))
        : [];
    let allPersonalDetailsOptions = havingLoginPersonalDetails;

    if (sortPersonalDetailsByAlphaAsc) {
        // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
        allPersonalDetailsOptions = lodashOrderBy(allPersonalDetailsOptions, [(personalDetail) => personalDetail.text?.toLowerCase()], 'asc');
    }

    const optionsToExclude: Option[] = [];

    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions || searchInputValue === '') {
        optionsToExclude.push(...selectedOptions);
    }

    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    let recentReportOptions = [];
    let personalDetailsOptions: ReportUtils.OptionData[] = [];

    const preferRecentExpenseReports = action === CONST.IOU.ACTION.CREATE;

    if (includeRecentReports) {
        for (const reportOption of allReportOptions) {
            /**
             * By default, generated options does not have the chat preview line enabled.
             * If showChatPreviewLine or forcePolicyNamePreview are true, let's generate and overwrite the alternate text.
             */
            reportOption.alternateText = getAlternateText(reportOption, {showChatPreviewLine, forcePolicyNamePreview});

            // Stop adding options to the recentReports array when we reach the maxRecentReportsToShow value
            if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
                break;
            }

            // Skip notifications@expensify.com
            if (reportOption.login === CONST.EMAIL.NOTIFICATIONS) {
                continue;
            }

            const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
                reportOption.isPolicyExpenseChat && reportOption.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !reportOption.private_isArchived;

            const shouldShowInvoiceRoom =
                includeInvoiceRooms &&
                ReportUtils.isInvoiceRoom(reportOption.item) &&
                ReportUtils.isPolicyAdmin(reportOption.policyID ?? '', policies) &&
                !reportOption.private_isArchived &&
                PolicyUtils.canSendInvoiceFromWorkspace(reportOption.policyID);

            /**
                Exclude the report option if it doesn't meet any of the following conditions:
                - It is not an owned policy expense chat that could be shown
                - Multiple participant reports are not included
                - It doesn't have a login
                - It is not an invoice room that should be shown
            */
            if (!isCurrentUserOwnedPolicyExpenseChatThatCouldShow && !includeMultipleParticipantReports && !reportOption.login && !shouldShowInvoiceRoom) {
                continue;
            }

            // If we're excluding threads, check the report to see if it has a single participant and if the participant is already selected
            if (
                !includeThreads &&
                (!!reportOption.login || reportOption.reportID) &&
                optionsToExclude.some((option) => option.login === reportOption.login || option.reportID === reportOption.reportID)
            ) {
                continue;
            }

            reportOption.isSelected = isReportSelected(reportOption, selectedOptions);
            reportOption.isBold = shouldBoldTitleByDefault || shouldUseBoldText(reportOption);

            if (action === CONST.IOU.ACTION.CATEGORIZE) {
                const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${reportOption.policyID}`] ?? {};
                if (getEnabledCategoriesCount(policyCategories) !== 0) {
                    recentReportOptions.push(reportOption);
                }
            } else {
                recentReportOptions.push(reportOption);
            }

            // Add a field to sort the recent reports by the time of last IOU request for create actions
            if (preferRecentExpenseReports) {
                const reportPreviewAction = allSortedReportActions[reportOption.reportID]?.find((reportAction) =>
                    ReportActionUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW),
                );

                if (reportPreviewAction) {
                    const iouReportID = ReportActionUtils.getIOUReportIDFromReportActionPreview(reportPreviewAction);
                    const iouReportActions = allSortedReportActions[iouReportID] ?? [];
                    const lastIOUAction = iouReportActions.find((iouAction) => iouAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                    if (lastIOUAction) {
                        reportOption.lastIOUCreationDate = lastIOUAction.lastModified;
                    }
                }
            }

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                optionsToExclude.push({login: reportOption.login});
            }
        }
    }

    const personalDetailsOptionsToExclude = [...optionsToExclude, {login: currentUserLogin}];
    // Next loop over all personal details removing any that are selectedUsers or recentChats
    for (const personalDetailOption of allPersonalDetailsOptions) {
        if (personalDetailsOptionsToExclude.some((optionToExclude) => optionToExclude.login === personalDetailOption.login)) {
            continue;
        }
        personalDetailOption.isBold = shouldBoldTitleByDefault;

        personalDetailsOptions.push(personalDetailOption);
    }

    const currentUserOption = allPersonalDetailsOptions.find((personalDetailsOption) => personalDetailsOption.login === currentUserLogin);

    let userToInvite: ReportUtils.OptionData | null = null;
    if (
        canCreateOptimisticPersonalDetailOption({
            searchValue,
            recentReportOptions,
            personalDetailsOptions,
            currentUserOption,
            excludeUnknownUsers,
        })
    ) {
        userToInvite = getUserToInviteOption({
            searchValue,
            excludeUnknownUsers,
            optionsToExclude,
            selectedOptions,
            reportActions,
            showChatPreviewLine,
        });
    }

    // If we are prioritizing 1:1 chats in search, do it only once we started searching
    if (sortByReportTypeInSearch && (searchValue !== '' || !!action)) {
        // When sortByReportTypeInSearch is true, recentReports will be returned with all the reports including personalDetailsOptions in the correct Order.
        // If we're in money request flow, we only order the recent report option.
        if (!action) {
            recentReportOptions.push(...personalDetailsOptions);
            personalDetailsOptions = [];
        }
        recentReportOptions = orderOptions(recentReportOptions, searchValue, {
            preferChatroomsOverThreads: true,
            preferPolicyExpenseChat: !!action,
            preferRecentExpenseReports,
        });
    }

    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        userToInvite: canInviteUser ? userToInvite : null,
        currentUserOption,
        categoryOptions: [],
        tagOptions: [],
        taxRatesOptions: [],
    };
}

/**
 * Build the options for the Search view
 */
function getSearchOptions(options: OptionList, searchValue = '', betas: Beta[] = [], isUsedInChatFinder = true): Options {
    Timing.start(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markStart(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    const optionList = getOptions(options, {
        betas,
        searchInputValue: searchValue.trim(),
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        sortByReportTypeInSearch: true,
        showChatPreviewLine: isUsedInChatFinder,
        includeP2P: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        includeSelfDM: true,
        shouldBoldTitleByDefault: !isUsedInChatFinder,
    });
    Timing.end(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markEnd(CONST.TIMING.LOAD_SEARCH_OPTIONS);

    return optionList;
}

function getShareLogOptions(options: OptionList, searchValue = '', betas: Beta[] = []): Options {
    return getOptions(options, {
        betas,
        searchInputValue: searchValue.trim(),
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        sortByReportTypeInSearch: true,
        includeP2P: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeSelfDM: true,
        includeThreads: true,
    });
}

/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail: OnyxEntry<PersonalDetails>, amountText?: string): PayeePersonalDetails {
    const formattedLogin = LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '');
    return {
        text: PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail, formattedLogin),
        alternateText: formattedLogin || PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail, '', false),
        icons: [
            {
                source: personalDetail?.avatar ?? FallbackAvatar,
                name: personalDetail?.login ?? '',
                type: CONST.ICON_TYPE_AVATAR,
                id: personalDetail?.accountID,
            },
        ],
        descriptiveText: amountText ?? '',
        login: personalDetail?.login ?? '',
        accountID: personalDetail?.accountID ?? -1,
        keyForList: String(personalDetail?.accountID ?? -1),
    };
}

/**
 * Build the options for the New Group view
 */
function getFilteredOptions(
    reports: Array<SearchOption<Report>> = [],
    personalDetails: Array<SearchOption<PersonalDetails>> = [],
    betas: OnyxEntry<Beta[]> = [],
    searchValue = '',
    selectedOptions: Array<Partial<ReportUtils.OptionData>> = [],
    excludeLogins: string[] = [],
    includeOwnedWorkspaceChats = false,
    includeP2P = true,
    includeCategories = false,
    categories: PolicyCategories = {},
    recentlyUsedCategories: string[] = [],
    includeTags = false,
    tags: PolicyTags | Array<PolicyTag | SelectedTagOption> = {},
    recentlyUsedTags: string[] = [],
    canInviteUser = true,
    includeSelectedOptions = false,
    includeTaxRates = false,
    maxRecentReportsToShow: number = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
    taxRates: TaxRatesWithDefault = {} as TaxRatesWithDefault,
    includeSelfDM = false,
    includePolicyReportFieldOptions = false,
    policyReportFieldOptions: string[] = [],
    recentlyUsedPolicyReportFieldOptions: string[] = [],
    includeInvoiceRooms = false,
    action: IOUAction | undefined = undefined,
    sortByReportTypeInSearch = false,
) {
    return getOptions(
        {reports, personalDetails},
        {
            betas,
            searchInputValue: searchValue.trim(),
            selectedOptions,
            includeRecentReports: true,
            maxRecentReportsToShow,
            excludeLogins,
            includeOwnedWorkspaceChats,
            includeP2P,
            includeCategories,
            categories,
            recentlyUsedCategories,
            includeTags,
            tags,
            recentlyUsedTags,
            canInviteUser,
            includeSelectedOptions,
            includeTaxRates,
            taxRates,
            includeSelfDM,
            includePolicyReportFieldOptions,
            policyReportFieldOptions,
            recentlyUsedPolicyReportFieldOptions,
            includeInvoiceRooms,
            action,
            sortByReportTypeInSearch,
        },
    );
}

/**
 * Build the options for the Share Destination for a Task
 */

function getShareDestinationOptions(
    reports: Array<SearchOption<Report>> = [],
    personalDetails: Array<SearchOption<PersonalDetails>> = [],
    betas: OnyxEntry<Beta[]> = [],
    searchValue = '',
    selectedOptions: Array<Partial<ReportUtils.OptionData>> = [],
    excludeLogins: string[] = [],
    includeOwnedWorkspaceChats = true,
    excludeUnknownUsers = true,
) {
    return getOptions(
        {reports, personalDetails},
        {
            betas,
            searchInputValue: searchValue.trim(),
            selectedOptions,
            maxRecentReportsToShow: 0, // Unlimited
            includeRecentReports: true,
            includeMultipleParticipantReports: true,
            showChatPreviewLine: true,
            forcePolicyNamePreview: true,
            includeThreads: true,
            includeMoneyRequests: true,
            includeTasks: true,
            excludeLogins,
            includeOwnedWorkspaceChats,
            excludeUnknownUsers,
            includeSelfDM: true,
        },
    );
}

/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param member - personalDetails or userToInvite
 * @param config - keys to overwrite the default values
 */
function formatMemberForList(member: ReportUtils.OptionData): MemberForList {
    const accountID = member.accountID;

    return {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        text: member.text || member.displayName || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        alternateText: member.alternateText || member.login || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        keyForList: member.keyForList || String(accountID ?? -1) || '',
        isSelected: member.isSelected ?? false,
        isDisabled: member.isDisabled ?? false,
        accountID,
        login: member.login ?? '',
        icons: member.icons,
        pendingAction: member.pendingAction,
        reportID: member.reportID ?? '-1',
    };
}

/**
 * Build the options for the Workspace Member Invite view
 */
function getMemberInviteOptions(
    personalDetails: Array<SearchOption<PersonalDetails>>,
    betas: Beta[] = [],
    searchValue = '',
    excludeLogins: string[] = [],
    includeSelectedOptions = false,
    reports: Array<SearchOption<Report>> = [],
    includeRecentReports = false,
): Options {
    return getOptions(
        {reports, personalDetails},
        {
            betas,
            searchInputValue: searchValue.trim(),
            includeP2P: true,
            excludeLogins,
            sortPersonalDetailsByAlphaAsc: true,
            includeSelectedOptions,
            includeRecentReports,
        },
    );
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions: boolean, hasUserToInvite: boolean, searchValue: string, hasMatchedParticipant = false): string {
    const isValidPhone = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }

    return '';
}

/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessageForNonUserList(hasSelectableOptions: boolean, searchValue: string): string {
    if (searchValue && !hasSelectableOptions) {
        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }
    return '';
}

/**
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option: ReportUtils.OptionData): boolean {
    return (!option.isChatRoom || !!option.isThread) && !option.private_isArchived;
}

/**
 * Handles the logic for displaying selected participants from the search term
 */
function formatSectionsFromSearchTerm(
    searchTerm: string,
    selectedOptions: ReportUtils.OptionData[],
    filteredRecentReports: ReportUtils.OptionData[],
    filteredPersonalDetails: ReportUtils.OptionData[],
    personalDetails: OnyxEntry<PersonalDetailsList> = {},
    shouldGetOptionDetails = false,
): SectionForSearchTerm {
    // We show the selected participants at the top of the list when there is no search term or maximum number of participants has already been selected
    // However, if there is a search term we remove the selected participants from the top of the list unless they are part of the search results
    // This clears up space on mobile views, where if you create a group with 4+ people you can't see the selected participants and the search results at the same time
    if (searchTerm === '') {
        return {
            section: {
                title: undefined,
                data: shouldGetOptionDetails
                    ? selectedOptions.map((participant) => {
                          const isPolicyExpenseChat = participant.isPolicyExpenseChat ?? false;
                          return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                      })
                    : selectedOptions,
                shouldShow: selectedOptions.length > 0,
            },
        };
    }

    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    // If you select a new user you don't have a contact for, they won't get returned as part of a recent report or personal details
    // This will add them to the list of options, deduping them if they already exist in the other lists
    const selectedParticipantsWithoutDetails = selectedOptions.filter((participant) => {
        const accountID = participant.accountID ?? null;
        const isPartOfSearchTerm = getPersonalDetailSearchTerms(participant).join(' ').toLowerCase().includes(cleanSearchTerm);
        const isReportInRecentReports = filteredRecentReports.some((report) => report.accountID === accountID);
        const isReportInPersonalDetails = filteredPersonalDetails.some((personalDetail) => personalDetail.accountID === accountID);
        return isPartOfSearchTerm && !isReportInRecentReports && !isReportInPersonalDetails;
    });

    return {
        section: {
            title: undefined,
            data: shouldGetOptionDetails
                ? selectedParticipantsWithoutDetails.map((participant) => {
                      const isPolicyExpenseChat = participant.isPolicyExpenseChat ?? false;
                      return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                  })
                : selectedParticipantsWithoutDetails,
            shouldShow: selectedParticipantsWithoutDetails.length > 0,
        },
    };
}

/**
 * Helper method to get the `keyForList` for the first option in the OptionsList
 */
function getFirstKeyForList(data?: Option[] | null) {
    if (!data?.length) {
        return '';
    }

    const firstNonEmptyDataObj = data.at(0);

    return firstNonEmptyDataObj?.keyForList ? firstNonEmptyDataObj?.keyForList : '';
}

function getPersonalDetailSearchTerms(item: Partial<ReportUtils.OptionData>) {
    return [item.participantsList?.[0]?.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

function getCurrentUserSearchTerms(item: ReportUtils.OptionData) {
    return [item.text ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}
/**
 * Filters options based on the search input value
 */
function filterOptions(options: Options, searchInputValue: string, config?: FilterOptionsConfig): Options {
    const {
        sortByReportTypeInSearch = false,
        canInviteUser = true,
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        preferChatroomsOverThreads = false,
        preferPolicyExpenseChat = false,
        preferRecentExpenseReports = false,
    } = config ?? {};
    if (searchInputValue.trim() === '' && maxRecentReportsToShow > 0) {
        return {...options, recentReports: options.recentReports.slice(0, maxRecentReportsToShow)};
    }

    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    const searchTerms = searchValue ? searchValue.split(' ') : [];

    const optionsToExclude: Option[] = [{login: CONST.EMAIL.NOTIFICATIONS}];

    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    const matchResults = searchTerms.reduceRight((items, term) => {
        const recentReports = filterArrayByMatch(items.recentReports, term, (item) => {
            const values: string[] = [];
            if (item.text) {
                values.push(item.text);
            }

            if (item.login) {
                values.push(item.login);
                values.push(item.login.replace(CONST.EMAIL_SEARCH_REGEX, ''));
            }

            if (item.isThread) {
                if (item.alternateText) {
                    values.push(item.alternateText);
                }
            } else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                if (item.subtitle) {
                    values.push(item.subtitle);
                }
            }

            return uniqFast(values);
        });
        const personalDetails = filterArrayByMatch(items.personalDetails, term, (item) => uniqFast(getPersonalDetailSearchTerms(item)));

        const currentUserOptionSearchText = items.currentUserOption ? uniqFast(getCurrentUserSearchTerms(items.currentUserOption)).join(' ') : '';

        const currentUserOption = isSearchStringMatch(term, currentUserOptionSearchText) ? items.currentUserOption : null;

        return {
            recentReports: recentReports ?? [],
            personalDetails: personalDetails ?? [],
            userToInvite: null,
            currentUserOption,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions: [],
        };
    }, options);

    let {recentReports, personalDetails} = matchResults;

    if (sortByReportTypeInSearch) {
        recentReports = recentReports.concat(personalDetails);
        personalDetails = [];
        recentReports = orderOptions(recentReports, searchValue);
    }

    let userToInvite = null;
    if (canInviteUser) {
        if (recentReports.length === 0 && personalDetails.length === 0) {
            userToInvite = getUserToInviteOption({
                searchValue,
                selectedOptions: config?.selectedOptions,
                optionsToExclude,
            });
        }
    }

    if (maxRecentReportsToShow > 0 && recentReports.length > maxRecentReportsToShow) {
        recentReports.splice(maxRecentReportsToShow);
    }

    return {
        personalDetails,
        recentReports: orderOptions(recentReports, searchValue, {preferChatroomsOverThreads, preferPolicyExpenseChat, preferRecentExpenseReports}),
        userToInvite,
        currentUserOption: matchResults.currentUserOption,
        categoryOptions: [],
        tagOptions: [],
        taxRatesOptions: [],
    };
}

function sortAlphabetically<T extends Partial<Record<TKey, string | undefined>>, TKey extends keyof T>(items: T[], key: TKey): T[] {
    return items.sort((a, b) => (a[key] ?? '').toLowerCase().localeCompare((b[key] ?? '').toLowerCase()));
}

function getEmptyOptions(): Options {
    return {
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
        currentUserOption: null,
        categoryOptions: [],
        tagOptions: [],
        taxRatesOptions: [],
    };
}

function shouldUseBoldText(report: ReportUtils.OptionData): boolean {
    return report.isUnread === true && ReportUtils.getReportNotificationPreference(report) !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE;
}

export {
    getAvatarsForAccountIDs,
    isCurrentUser,
    isPersonalDetailsReady,
    getSearchOptions,
    getFilteredOptions,
    getShareDestinationOptions,
    getMemberInviteOptions,
    getHeaderMessage,
    getHeaderMessageForNonUserList,
    getSearchValueForPhoneOrEmail,
    getPersonalDetailsForAccountIDs,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    isSearchStringMatchUserDetails,
    getAllReportErrors,
    getPolicyExpenseReportOption,
    getIOUReportIDOfLastAction,
    getParticipantsOption,
    isSearchStringMatch,
    shouldOptionShowTooltip,
    getLastActorDisplayName,
    getLastMessageTextForReport,
    getEnabledCategoriesCount,
    hasEnabledOptions,
    sortCategories,
    sortAlphabetically,
    sortTags,
    getCategoryOptionTree,
    hasEnabledTags,
    formatMemberForList,
    formatSectionsFromSearchTerm,
    getShareLogOptions,
    filterOptions,
    createOptionList,
    createOptionFromReport,
    getReportOption,
    getTaxRatesSection,
    getFirstKeyForList,
    canCreateOptimisticPersonalDetailOption,
    getUserToInviteOption,
    shouldShowViolations,
    getPersonalDetailSearchTerms,
    getCurrentUserSearchTerms,
    getEmptyOptions,
    shouldUseBoldText,
    getAlternateText,
    getReportDisplayOption,
};

export type {MemberForList, CategorySection, CategoryTreeSection, Options, OptionList, SearchOption, PayeePersonalDetails, Category, Tax, TaxRatesOption, Option, OptionTree};
