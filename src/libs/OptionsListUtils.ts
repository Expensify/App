/* eslint-disable no-continue */
import {SvgProps} from 'react-native-svg';
import _ from 'underscore';
import Onyx, {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import lodashOrderBy from 'lodash/orderBy';
import {ValueOf} from 'type-fest';
import Str from 'expensify-common/lib/str';
import {parsePhoneNumber} from 'awesome-phonenumber';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as ReportUtils from './ReportUtils';
import * as Localize from './Localize';
import Permissions from './Permissions';
import * as CollectionUtils from './CollectionUtils';
import Navigation from './Navigation/Navigation';
import * as LoginUtils from './LoginUtils';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as UserUtils from './UserUtils';
import * as ReportActionUtils from './ReportActionsUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as ErrorUtils from './ErrorUtils';
import {Beta, Login, Participant, PersonalDetails, Policy, PolicyCategory, Report, ReportAction} from '../types/onyx';
import * as OnyxCommon from '../types/onyx/OnyxCommon';

type PersonalDetailsCollection = Record<number, PersonalDetails | {accountID: number; login: string; avatar: string}>;
type Avatar = {
    source: string | (() => void);
    name: string;
    type: ValueOf<typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_WORKSPACE>;
    id: number | string;
};

type Option = {
    text?: string | null;
    boldStyle?: boolean;
    alternateText?: string | null;
    alternateTextMaxLines?: number;
    icons?: Avatar[] | null;
    login?: string | null;
    reportID?: string | null;
    hasDraftComment?: boolean;
    keyForList?: string | null;
    searchText?: string | null;
    isPinned?: boolean;
    isChatRoom?: boolean;
    hasOutstandingIOU?: boolean;
    customIcon?: {src: React.FC<SvgProps>; color: string};
    participantsList?: Array<Partial<PersonalDetails>> | null;
    descriptiveText?: string;
    type?: string;
    tooltipText?: string | null;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | null | '';
    phoneNumber?: string | null;
    pendingAction?: Record<string, string> | null;
    allReportErrors?: OnyxCommon.Errors | null;
    isDefaultRoom: boolean;
    isArchivedRoom: boolean;
    isPolicyExpenseChat: boolean;
    isExpenseReport: boolean;
    isMoneyRequestReport?: boolean;
    isThread?: boolean;
    isTaskReport?: boolean;
    shouldShowSubscript: boolean;
    ownerAccountID?: number | null;
    isUnread?: boolean;
    iouReportID?: string | number | null;
    isWaitingOnBankAccount?: boolean;
    policyID?: string | null;
    subtitle?: string | null;
    accountID: number | null;
    iouReportAmount: number;
    isIOUReportOwner: boolean | null;
    isOptimisticAccount?: boolean;
};

type Tag = {enabled: boolean; name: string};

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
    callback: (value) => (loginList = Object.keys(value ?? {}).length === 0 ? {} : value),
});

let allPersonalDetails: OnyxEntry<Record<string, PersonalDetails>>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = Object.keys(value ?? {}).length === 0 ? {} : value),
});

let preferredLocale: OnyxEntry<ValueOf<typeof CONST.LOCALES>>;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (value) => (preferredLocale = value ?? CONST.LOCALES.DEFAULT),
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

const lastReportActions: Record<string, ReportAction> = {};
const allSortedReportActions: Record<string, ReportAction[]> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const sortedReportActions = ReportActionUtils.getSortedReportActions(_.toArray(actions), true);
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allSortedReportActions[reportID] = sortedReportActions;
        lastReportActions[reportID] = sortedReportActions[0];
    },
});

const policyExpenseReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!ReportUtils.isPolicyExpenseChat(report)) {
            return;
        }
        policyExpenseReports[key] = report;
    },
});

/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(report: Report & {selected?: boolean; searchText?: string}) {
    const expenseReport = policyExpenseReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`];
    const policyExpenseChatAvatarSource = ReportUtils.getWorkspaceAvatar(expenseReport);
    const reportName = ReportUtils.getReportName(expenseReport);
    return {
        ...expenseReport,
        keyForList: expenseReport?.policyID,
        text: reportName,
        alternateText: Localize.translateLocal('workspace.common.workspace'),
        icons: [
            {
                source: policyExpenseChatAvatarSource,
                name: reportName,
                type: CONST.ICON_TYPE_WORKSPACE,
            },
        ],
        selected: report.selected,
        isPolicyExpenseChat: true,
        searchText: report.searchText,
    };
}

/**
 * Adds expensify SMS domain (@expensify.sms) if login is a phone number and if it's not included yet
 */
function addSMSDomainIfPhoneNumber(login: string): string {
    const parsedPhoneNumber = parsePhoneNumber(login);
    if (parsedPhoneNumber.possible && !Str.isValidEmail(login)) {
        return parsedPhoneNumber.number?.e164 + CONST.SMS.DOMAIN;
    }
    return login;
}

/**
 * Returns avatar data for a list of user accountIDs
 */
function getAvatarsForAccountIDs(accountIDs: number[], personalDetails: PersonalDetailsCollection, defaultValues: Record<string, number> = {}) {
    const reversedDefaultValues: Record<number, string> = {};

    Object.entries(defaultValues).forEach((item) => {
        reversedDefaultValues[item[1]] = item[0];
    });
    return accountIDs.map((accountID) => {
        const login = reversedDefaultValues[accountID] ?? '';
        const userPersonalDetail = personalDetails[accountID] ?? {login, accountID, avatar: ''};

        return {
            id: accountID,
            source: UserUtils.getAvatar(userPersonalDetail.avatar, userPersonalDetail.accountID),
            type: CONST.ICON_TYPE_AVATAR,
            name: userPersonalDetail.login,
        };
    });
}

/**
 * Returns the personal details for an array of accountIDs
 * @returns  keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs: number[], personalDetails: PersonalDetailsCollection) {
    const personalDetailsForAccountIDs: Record<number, Partial<PersonalDetails>> = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    accountIDs?.forEach((accountID) => {
        const cleanAccountID = Number(accountID);
        let personalDetail: Partial<PersonalDetails> = personalDetails[accountID];
        if (!personalDetail) {
            personalDetail = {
                avatar: UserUtils.getDefaultAvatar(cleanAccountID),
            };
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
function isPersonalDetailsReady(personalDetails: PersonalDetailsCollection): boolean {
    const personalDetailsKeys = Object.keys(personalDetails ?? {});
    return personalDetailsKeys.length > 0 && personalDetailsKeys.some((key) => personalDetails[Number(key)].accountID);
}

/**
 * Get the participant option for a report.
 */
function getParticipantsOption(participant: Participant & {searchText?: string}, personalDetails: PersonalDetailsCollection) {
    const detail = getPersonalDetailsForAccountIDs([participant.accountID], personalDetails)[participant.accountID];
    const login = detail.login ?? participant.login ?? '';
    const displayName = detail.displayName ?? LocalePhoneNumber.formatPhoneNumber(login);
    return {
        keyForList: String(detail.accountID),
        login,
        accountID: detail.accountID,
        text: displayName,
        firstName: detail.firstName ?? '',
        lastName: detail.lastName ?? '',
        alternateText: LocalePhoneNumber.formatPhoneNumber(login) || displayName,
        icons: [
            {
                source: UserUtils.getAvatar(detail.avatar ?? '', detail.accountID ?? 0),
                name: login,
                type: CONST.ICON_TYPE_AVATAR,
                id: detail.accountID,
            },
        ],
        phoneNumber: detail.phoneNumber ?? '',
        selected: participant.selected,
        searchText: participant.searchText,
    };
}

/**
 * Constructs a Set with all possible names (displayName, firstName, lastName, email) for all participants in a report,
 * to be used in isSearchStringMatch.
 */
function getParticipantNames(personalDetailList?: Array<Partial<PersonalDetails>> | null): Set<string> {
    // We use a Set because `Set.has(value)` on a Set of with n entries is up to n (or log(n)) times faster than
    // `_.contains(Array, value)` for an Array with n members.
    const participantNames = new Set<string>();
    personalDetailList?.forEach((participant) => {
        if (participant.login) {
            participantNames.add(participant.login.toLowerCase());
        }
        if (participant.firstName) {
            participantNames.add(participant.firstName.toLowerCase());
        }
        if (participant.lastName) {
            participantNames.add(participant.lastName.toLowerCase());
        }
        if (participant.displayName) {
            participantNames.add(participant.displayName.toLowerCase());
        }
    });
    return participantNames;
}

/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 */
function uniqFast(items: string[]) {
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
 * Returns a string with all relevant search terms.
 * Default should be serachable by policy/domain name but not by participants.
 *
 * This method must be incredibly performant. It was found to be a big performance bottleneck
 * when dealing with accounts that have thousands of reports. For loops are more efficient than _.each
 * Array.prototype.push.apply is faster than using the spread operator, and concat() is faster than push().

 */
function getSearchText(report: Report, reportName: string, personalDetailList: Array<Partial<PersonalDetails>>, isChatRoomOrPolicyExpenseChat: boolean, isThread: boolean): string {
    let searchTerms: string[] = [];

    if (!isChatRoomOrPolicyExpenseChat) {
        for (const personalDetail of personalDetailList) {
            if (personalDetail.login) {
                // The regex below is used to remove dots only from the local part of the user email (local-part@domain)
                // so that we can match emails that have dots without explicitly writing the dots (e.g: fistlast@domain will match first.last@domain)
                // More info https://github.com/Expensify/App/issues/8007
                searchTerms = searchTerms.concat([personalDetail.displayName ?? '', personalDetail.login, personalDetail.login.replace(/\.(?=[^\s@]*@)/g, '')]);
            }
        }
    }
    if (report) {
        Array.prototype.push.apply(searchTerms, reportName.split(/[,\s]/));

        if (isThread) {
            const title = ReportUtils.getReportName(report);
            const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(report);

            Array.prototype.push.apply(searchTerms, title.split(/[,\s]/));
            Array.prototype.push.apply(searchTerms, chatRoomSubtitle.split(/[,\s]/));
        } else if (isChatRoomOrPolicyExpenseChat) {
            const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(report);

            Array.prototype.push.apply(searchTerms, chatRoomSubtitle.split(/[,\s]/));
        } else {
            const participantAccountIDs = report.participantAccountIDs ?? [];
            if (allPersonalDetails) {
                for (const accountID of participantAccountIDs) {
                    const login = allPersonalDetails[accountID]?.login;
                    if (login) {
                        searchTerms.push(login);
                    }
                }
            }
        }
    }

    return uniqFast(searchTerms).join(' ');
}

/**
 * Get an object of error messages keyed by microtime by combining all error objects related to the report.
 */
function getAllReportErrors(report: Report, reportActions: Record<string, ReportAction>) {
    const reportErrors = report.errors ?? {};
    const reportErrorFields = report.errorFields ?? {};
    const reportActionErrors: OnyxCommon.Errors = {};
    Object.values(reportActions ?? {}).forEach((action) => {
        if (action && Object.keys(action.errors ?? {}).length > 0) {
            Object.assign(reportActionErrors, action.errors);
        } else if (ReportActionUtils.isReportPreviewAction(action)) {
            const iouReportID = ReportActionUtils.getIOUReportIDFromReportActionPreview(action);

            // Instead of adding all Smartscan errors, let's just add a generic error if there are any. This
            // will be more performant and provide the same result in the UI
            if (ReportUtils.hasMissingSmartscanFields(iouReportID)) {
                Object.assign(reportActionErrors, {smartscan: ErrorUtils.getMicroSecondOnyxError('report.genericSmartscanFailureMessage')});
            }
        }
    });

    // All error objects related to the report. Each object in the sources contains error messages keyed by microtime
    const errorSources = {
        reportErrors,
        ...reportErrorFields,
        reportActionErrors,
    };
    // Combine all error messages keyed by microtime into one object
    const allReportErrors = Object.values(errorSources)?.reduce(
        (prevReportErrors, errors) => (Object.keys(errors ?? {}).length > 0 ? prevReportErrors : Object.assign(prevReportErrors, errors)),
        {},
    );

    return allReportErrors;
}

/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport(report: Report) {
    const lastReportAction = allSortedReportActions[report.reportID ?? '']?.find(
        (reportAction, key) => ReportActionUtils.shouldReportActionBeVisible(reportAction, String(key)) && reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );

    let lastMessageTextFromReport = '';
    const lastActionName = lodashGet(lastReportAction, 'actionName', '');

    if (ReportUtils.isReportMessageAttachment({text: report.lastMessageText ?? '', html: report.lastMessageHtml ?? '', translationKey: report.lastMessageTranslationKey ?? ''})) {
        lastMessageTextFromReport = `[${Localize.translateLocal(report.lastMessageTranslationKey ?? 'common.attachment')}]`;
    } else if (ReportActionUtils.isMoneyRequestAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getReportPreviewMessage(report, lastReportAction, true);
    } else if (ReportActionUtils.isReportPreviewAction(lastReportAction)) {
        const iouReport = ReportUtils.getReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastReportAction));
        lastMessageTextFromReport = ReportUtils.getReportPreviewMessage(iouReport, lastReportAction);
    } else if (ReportActionUtils.isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = ReportUtils.getModifiedExpenseMessage(lastReportAction);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (
        lastActionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED
    ) {
        lastMessageTextFromReport = lodashGet(lastReportAction, 'message[0].text', '');
    } else {
        lastMessageTextFromReport = report ? report.lastMessageText ?? '' : '';

        // Yeah this is a bit ugly. If the latest report action that is not a whisper has been moderated as pending remove
        // then set the last message text to the text of the latest visible action that is not a whisper or the report creation message.
        const lastNonWhisper = allSortedReportActions[report.reportID ?? '']?.find((action) => !ReportActionUtils.isWhisperAction(action)) ?? {};
        if (ReportActionUtils.isPendingRemove(lastNonWhisper)) {
            const latestVisibleAction: ReportAction | undefined = allSortedReportActions[report.reportID ?? ''].find(
                (action) => ReportActionUtils.shouldReportActionBeVisibleAsLastAction(action) && !ReportActionUtils.isCreatedAction(action),
            );
            lastMessageTextFromReport = latestVisibleAction?.message?.[0].text ?? '';
        }
    }
    return lastMessageTextFromReport;
}

/**
 * Creates a report list option
 */
function createOption(
    accountIDs: number[],
    personalDetails: PersonalDetailsCollection,
    report: Report,
    reportActions: Record<string, ReportAction>,
    {showChatPreviewLine = false, forcePolicyNamePreview = false}: {showChatPreviewLine?: boolean; forcePolicyNamePreview?: boolean},
) {
    const result: Option = {
        text: null,
        alternateText: null,
        pendingAction: null,
        allReportErrors: null,
        brickRoadIndicator: null,
        icons: null,
        tooltipText: null,
        ownerAccountID: null,
        subtitle: null,
        participantsList: null,
        accountID: 0,
        login: null,
        reportID: null,
        phoneNumber: null,
        hasDraftComment: false,
        keyForList: null,
        searchText: null,
        isDefaultRoom: false,
        isPinned: false,
        hasOutstandingIOU: false,
        isWaitingOnBankAccount: false,
        iouReportID: null,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        isArchivedRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isExpenseReport: false,
        policyID: null,
    };

    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = Object.values(personalDetailMap);
    const personalDetail = personalDetailList[0] ?? {};
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;

    result.participantsList = personalDetailList;

    if (report) {
        result.isChatRoom = ReportUtils.isChatRoom(report);
        result.isDefaultRoom = ReportUtils.isDefaultRoom(report);
        result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
        result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        result.isExpenseReport = ReportUtils.isExpenseReport(report);
        result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        result.isThread = ReportUtils.isChatThread(report);
        result.isTaskReport = ReportUtils.isTaskReport(report);
        result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
        result.allReportErrors = getAllReportErrors(report, reportActions);
        result.brickRoadIndicator = !_.isEmpty(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom ?? report.pendingFields.createChat : null;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        result.isUnread = ReportUtils.isUnread(report);
        result.hasDraftComment = report.hasDraft;
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.tooltipText = ReportUtils.getReportParticipantsTitle(report.participantAccountIDs ?? []);
        result.hasOutstandingIOU = report.hasOutstandingIOU;
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;

        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat;
        subtitle = ReportUtils.getChatRoomSubtitle(report);

        const lastMessageTextFromReport = getLastMessageTextForReport(report);
        const lastActorDetails = personalDetailMap[report.lastActorAccountID ?? 0] ?? null;
        let lastMessageText = hasMultipleParticipants && lastActorDetails && lastActorDetails.accountID !== currentUserAccountID ? `${lastActorDetails.displayName}: ` : '';
        lastMessageText += report ? lastMessageTextFromReport : '';

        if (result.isArchivedRoom) {
            const archiveReason = lastReportActions[report.reportID ?? ''].originalMessage?.reason ?? CONST.REPORT.ARCHIVE_REASON.DEFAULT;
            lastMessageText = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
                displayName: archiveReason.displayName ?? PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails, 'displayName'),
                policyName: ReportUtils.getPolicyName(report),
            });
        }

        if (result.isChatRoom || result.isPolicyExpenseChat) {
            result.alternateText = showChatPreviewLine && !forcePolicyNamePreview && lastMessageText ? lastMessageText : subtitle;
        } else if (result.isMoneyRequestReport) {
            result.alternateText = lastMessageTextFromReport.length > 0 ? lastMessageText : Localize.translate(preferredLocale, 'report.noActivityYet');
        } else if (result.isTaskReport) {
            result.alternateText = showChatPreviewLine && lastMessageText ? lastMessageTextFromReport : Localize.translate(preferredLocale, 'report.noActivityYet');
        } else {
            result.alternateText = showChatPreviewLine && lastMessageText ? lastMessageText : LocalePhoneNumber.formatPhoneNumber(personalDetail.login);
        }
        reportName = ReportUtils.getReportName(report);
    } else {
        reportName = ReportUtils.getDisplayNameForParticipant(accountIDs[0]);
        result.keyForList = String(accountIDs[0]);

        result.alternateText = LocalePhoneNumber.formatPhoneNumber(personalDetails[accountIDs[0]].login ?? '');
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils.getMoneyRequestTotal(result);

    if (!hasMultipleParticipants) {
        result.login = personalDetail.login;
        result.accountID = Number(personalDetail.accountID);
        result.phoneNumber = personalDetail.phoneNumber;
    }

    result.text = reportName;
    result.searchText = getSearchText(report, reportName, personalDetailList, result.isChatRoom ?? result.isPolicyExpenseChat, result.isThread);
    result.icons = ReportUtils.getIcons(report, personalDetails, UserUtils.getAvatar(personalDetail.avatar ?? '', personalDetail.accountID), personalDetail.login, personalDetail.accountID);
    result.subtitle = subtitle;

    return result;
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
    const userDetailsLogin = addSMSDomainIfPhoneNumber(userDetails.login ?? '');

    if (currentUserLogin?.toLowerCase() === userDetailsLogin.toLowerCase()) {
        return true;
    }

    // Check if userDetails login exists in loginList
    return Object.keys(loginList ?? {}).some((login) => login.toLowerCase() === userDetailsLogin.toLowerCase());
}

/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(options: Record<string, PolicyCategory>): number {
    return Object.values(options).filter((option) => option.enabled).length;
}

/**
 * Verifies that there is at least one enabled option
 */
function hasEnabledOptions(options: Record<string, PolicyCategory>): boolean {
    return Object.values(options).some((option) => option.enabled);
}

/**
 * Build the options for the category tree hierarchy via indents
 */
function getCategoryOptionTree(options: PolicyCategory[], isOneLine = false) {
    const optionCollection: Record<
        string,
        {
            text: string;
            keyForList: string;
            searchText: string;
            tooltipText: string;
            isDisabled: boolean;
        }
    > = {};

    Object.values(options).forEach((option) => {
        if (!option.enabled) {
            return;
        }

        if (isOneLine) {
            if (Object.prototype.hasOwnProperty.call(optionCollection, option.name)) {
                return;
            }

            optionCollection[option.name] = {
                text: option.name,
                keyForList: option.name,
                searchText: option.name,
                tooltipText: option.name,
                isDisabled: !option.enabled,
            };

            return;
        }

        option.name.split(CONST.PARENT_CHILD_SEPARATOR).forEach((optionName, index, array) => {
            const indents = _.times(index, () => CONST.INDENTS).join('');
            const isChild = array.length - 1 === index;

            if (_.has(optionCollection, optionName)) {
                return;
            }

            optionCollection[optionName] = {
                text: `${indents}${optionName}`,
                keyForList: optionName,
                searchText: array.slice(0, index + 1).join(CONST.PARENT_CHILD_SEPARATOR),
                tooltipText: optionName,
                isDisabled: isChild ? !option.enabled : true,
            };
        });
    });

    return Object.values(optionCollection);
}

/**
 * Build the section list for categories
 */
function getCategoryListSections(
    categories: Record<string, PolicyCategory>,
    recentlyUsedCategories: string[],
    selectedOptions: PolicyCategory[],
    searchInputValue: string,
    maxRecentReportsToShow: number,
) {
    const categorySections = [];
    const categoriesValues = Object.values(categories).filter((category) => category.enabled);

    const numberOfCategories = categoriesValues.length;
    let indexOffset = 0;

    if (numberOfCategories === 0 && selectedOptions.length > 0) {
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getCategoryOptionTree(selectedOptions, true),
        });

        return categorySections;
    }

    if (searchInputValue) {
        const searchCategories = categoriesValues.filter((category) => category.name.toLowerCase().includes(searchInputValue.toLowerCase()));

        categorySections.push({
            // "Search" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getCategoryOptionTree(searchCategories, true),
        });

        return categorySections;
    }

    if (numberOfCategories < CONST.CATEGORY_LIST_THRESHOLD) {
        categorySections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            indexOffset,
            data: getCategoryOptionTree(categoriesValues),
        });

        return categorySections;
    }

    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.name);
    const filteredRecentlyUsedCategories = recentlyUsedCategories
        .filter((category) => !selectedOptionNames.includes(category))
        .map((category) => ({
            name: category,
            enabled: lodashGet(categories, `${category}.enabled`, false),
        }));
    const filteredCategories = categoriesValues.filter((category) => !selectedOptionNames.includes(category.name));

    if (selectedOptions) {
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getCategoryOptionTree(selectedOptions, true),
        });

        indexOffset += selectedOptions.length;
    }

    if (!_.isEmpty(filteredRecentlyUsedCategories)) {
        const cutRecentlyUsedCategories = filteredRecentlyUsedCategories.slice(0, maxRecentReportsToShow);

        categorySections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            indexOffset,
            data: getCategoryOptionTree(cutRecentlyUsedCategories, true),
        });

        indexOffset += filteredRecentlyUsedCategories.length;
    }

    categorySections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        indexOffset,
        data: getCategoryOptionTree(filteredCategories),
    });

    return categorySections;
}

/**
 * Transforms the provided tags into objects with a specific structure.
 */
function getTagsOptions(tags: Tag[]) {
    return tags.map((tag) => ({
        text: tag.name,
        keyForList: tag.name,
        searchText: tag.name,
        tooltipText: tag.name,
        isDisabled: !tag.enabled,
    }));
}

/**
 * Build the section list for tags
 */
function getTagListSections(tags: Tag[], recentlyUsedTags: string[], selectedOptions: Array<{name: string; enabled: boolean}>, searchInputValue: string, maxRecentReportsToShow: number) {
    const tagSections = [];
    const enabledTags = tags.filter((tag) => tag.enabled);
    const numberOfTags = enabledTags.length;
    let indexOffset = 0;

    // If all tags are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTags === 0 && selectedOptions.length > 0) {
        const selectedTagOptions = selectedOptions.map((option) => ({
            name: option.name,
            // Should be marked as enabled to be able to be de-selected
            enabled: true,
        }));
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getTagsOptions(selectedTagOptions),
        });

        return tagSections;
    }

    if (searchInputValue) {
        const searchTags = enabledTags.filter((tag) => tag.name.toLowerCase().includes(searchInputValue.toLowerCase()));

        tagSections.push({
            // "Search" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getTagsOptions(searchTags),
        });

        return tagSections;
    }

    if (numberOfTags < CONST.TAG_LIST_THRESHOLD) {
        tagSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            indexOffset,
            data: getTagsOptions(enabledTags),
        });

        return tagSections;
    }

    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.name);
    const filteredRecentlyUsedTags = recentlyUsedTags
        .filter((recentlyUsedTag) => {
            const tagObject = tags.find((tag) => tag.name === recentlyUsedTag);
            return Boolean(tagObject && tagObject.enabled) && !selectedOptionNames.includes(recentlyUsedTag);
        })
        .map((tag) => ({name: tag, enabled: true}));
    const filteredTags = enabledTags.filter((tag) => !selectedOptionNames.includes(tag.name));

    if (selectedOptions) {
        const selectedTagOptions = selectedOptions.map((option) => {
            const tagObject = tags.find((tag) => tag.name === option.name);
            return {
                name: option.name,
                enabled: Boolean(tagObject && tagObject.enabled),
            };
        });

        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getTagsOptions(selectedTagOptions),
        });

        indexOffset += selectedOptions.length;
    }

    if (!_.isEmpty(filteredRecentlyUsedTags)) {
        const cutRecentlyUsedTags = filteredRecentlyUsedTags.slice(0, maxRecentReportsToShow);

        tagSections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            indexOffset,
            data: getTagsOptions(cutRecentlyUsedTags),
        });

        indexOffset += filteredRecentlyUsedTags.length;
    }

    tagSections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        indexOffset,
        data: getTagsOptions(filteredTags),
    });

    return tagSections;
}

/**
 * Build the options
 */
function getOptions(
    reports: Record<string, Report>,
    personalDetails: PersonalDetailsCollection,
    {
        reportActions = {},
        betas = [],
        selectedOptions = [],
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        includeMultipleParticipantReports = false,
        includePersonalDetails = false,
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
    }: {
        betas: Beta[];
        reportActions?: Record<string, ReportAction>;
        selectedOptions?: any[];
        maxRecentReportsToShow?: number;
        excludeLogins?: any[];
        includeMultipleParticipantReports?: boolean;
        includePersonalDetails?: boolean;
        includeRecentReports?: boolean;
        // When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well.
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
        categories?: Record<string, PolicyCategory>;
        recentlyUsedCategories?: any[];
        includeTags?: boolean;
        tags?: Record<string, Tag>;
        recentlyUsedTags?: any[];
        canInviteUser?: boolean;
    },
) {
    if (includeCategories) {
        const categoryOptions = getCategoryListSections(categories, recentlyUsedCategories, selectedOptions, searchInputValue, maxRecentReportsToShow);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions,
            tagOptions: [],
        };
    }

    if (includeTags) {
        const tagOptions = getTagListSections(Object.values(tags), recentlyUsedTags, selectedOptions, searchInputValue, maxRecentReportsToShow);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions,
        };
    }

    if (!isPersonalDetailsReady(personalDetails)) {
        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions: [],
        };
    }

    let recentReportOptions = [];
    let personalDetailsOptions: Option[] = [];
    const reportMapForAccountIDs: Record<number, Report> = {};
    const parsedPhoneNumber = parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible ? parsedPhoneNumber.number?.e164 : searchInputValue.toLowerCase();

    // Filter out all the reports that shouldn't be displayed
    const filteredReports = Object.values(reports).filter((report) => ReportUtils.shouldReportBeInOptionList(report, Navigation.getTopmostReportId(), false, betas, policies));

    // Sorting the reports works like this:
    // - Order everything by the last message timestamp (descending)
    // - All archived reports should remain at the bottom
    const orderedReports = _.sortBy(filteredReports, (report) => {
        if (ReportUtils.isArchivedRoom(report)) {
            return CONST.DATE.UNIX_EPOCH;
        }

        return report.lastVisibleActionCreated;
    });
    orderedReports.reverse();

    const allReportOptions: Option[] = [];
    orderedReports.forEach((report) => {
        if (!report) {
            return;
        }

        const isThread = ReportUtils.isChatThread(report);
        const isChatRoom = ReportUtils.isChatRoom(report);
        const isTaskReport = ReportUtils.isTaskReport(report);
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        const accountIDs = report.participantAccountIDs ?? [];

        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            return;
        }

        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to workspace chats only.
        if (!includeP2P && !isPolicyExpenseChat) {
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

        // In case user needs to add credit bank account, don't allow them to request more money from the workspace.
        if (includeOwnedWorkspaceChats && ReportUtils.hasIOUWaitingOnCurrentUserBankAccount(report)) {
            return;
        }

        // Save the report in the map if this is a single participant so we can associate the reportID with the
        // personal detail option later. Individuals should not be associated with single participant
        // policyExpenseChats or chatRooms since those are not people.
        if (accountIDs.length <= 1 && !isPolicyExpenseChat && !isChatRoom) {
            reportMapForAccountIDs[accountIDs[0]] = report;
        }
        const isSearchingSomeonesPolicyExpenseChat = !report.isOwnPolicyExpenseChat && searchValue !== '';

        // Checks to see if the current user is the admin of the policy, if so the policy
        // name preview will be shown.
        const isPolicyChatAdmin = ReportUtils.isPolicyExpenseChatAdmin(report, policies);

        allReportOptions.push(
            createOption(accountIDs, personalDetails, report, reportActions, {
                showChatPreviewLine,
                forcePolicyNamePreview: isPolicyExpenseChat ? isSearchingSomeonesPolicyExpenseChat || isPolicyChatAdmin : forcePolicyNamePreview,
            }),
        );
    });
    // We're only picking personal details that have logins set
    // This is a temporary fix for all the logic that's been breaking because of the new privacy changes
    // See https://github.com/Expensify/Expensify/issues/293465 for more context
    // Moreover, we should not override the personalDetails object, otherwise the createOption util won't work properly, it returns incorrect tooltipText
    const havingLoginPersonalDetails = !includeP2P ? {} : _.pick(personalDetails, (detail) => Boolean(detail.login));
    let allPersonalDetailsOptions = Object.values(havingLoginPersonalDetails).map((personalDetail) =>
        createOption([personalDetail?.accountID ?? 0], personalDetails, reportMapForAccountIDs[personalDetail?.accountID], reportActions, {
            showChatPreviewLine,
            forcePolicyNamePreview,
        }),
    );

    if (sortPersonalDetailsByAlphaAsc) {
        // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
        allPersonalDetailsOptions = lodashOrderBy(allPersonalDetailsOptions, [(personalDetail) => personalDetail.text?.toLowerCase()], 'asc');
    }

    // Always exclude already selected options and the currently logged in user
    const optionsToExclude = [...selectedOptions, {login: currentUserLogin}];

    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    if (includeRecentReports) {
        for (const reportOption of allReportOptions) {
            // Stop adding options to the recentReports array when we reach the maxRecentReportsToShow value
            if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
                break;
            }

            const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
                reportOption.isPolicyExpenseChat && reportOption.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !reportOption.isArchivedRoom;

            // Skip if we aren't including multiple participant reports and this report has multiple participants
            if (!isCurrentUserOwnedPolicyExpenseChatThatCouldShow && !includeMultipleParticipantReports && !reportOption.login) {
                continue;
            }

            // If we're excluding threads, check the report to see if it has a single participant and if the participant is already selected
            if (
                !includeThreads &&
                (reportOption.login ?? reportOption.reportID) &&
                optionsToExclude.some((option) => (option.login && option.login === reportOption.login) ?? option.reportID === reportOption.reportID)
            ) {
                continue;
            }

            // Finally check to see if this option is a match for the provided search string if we have one
            const {searchText, participantsList, isChatRoom} = reportOption;
            const participantNames = getParticipantNames(participantsList);

            if (searchValue) {
                // Determine if the search is happening within a chat room and starts with the report ID
                const isReportIdSearch = isChatRoom && Str.startsWith(reportOption.reportID ?? '', searchValue);

                // Check if the search string matches the search text or participant names considering the type of the room
                const isSearchMatch = isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom);

                if (!isReportIdSearch && !isSearchMatch) {
                    continue;
                }
            }

            recentReportOptions.push(reportOption);

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                optionsToExclude.push({login: reportOption.login});
            }
        }
    }

    if (includePersonalDetails) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        allPersonalDetailsOptions.forEach((personalDetailOption) => {
            if (optionsToExclude.some((optionToExclude) => optionToExclude.login === personalDetailOption.login)) {
                return;
            }
            const {searchText, participantsList, isChatRoom} = personalDetailOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom)) {
                return;
            }
            personalDetailsOptions.push(personalDetailOption);
        });
    }

    let currentUserOption = allPersonalDetailsOptions.find((personalDetailsOption) => personalDetailsOption.login === currentUserLogin);
    if (searchValue && currentUserOption && !isSearchStringMatch(searchValue, currentUserOption.searchText)) {
        currentUserOption = null;
    }

    let userToInvite = null;
    const noOptions = recentReportOptions.length + personalDetailsOptions.length === 0 && !currentUserOption;
    const noOptionsMatchExactly = !personalDetailsOptions.concat(recentReportOptions).find((option) => option.login === addSMSDomainIfPhoneNumber(searchValue ?? '').toLowerCase());

    if (
        searchValue &&
        (noOptions || noOptionsMatchExactly) &&
        !isCurrentUser({login: searchValue}) &&
        selectedOptions.every((option) => option.login !== searchValue) &&
        ((Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN)) ||
            (parsedPhoneNumber.possible && Str.isValidPhone(LoginUtils.getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? '')))) &&
        !optionsToExclude.find((optionToExclude) => optionToExclude.login === addSMSDomainIfPhoneNumber(searchValue).toLowerCase()) &&
        (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos(betas)) &&
        !excludeUnknownUsers
    ) {
        // Generates an optimistic account ID for new users not yet saved in Onyx
        const optimisticAccountID = UserUtils.generateAccountID(searchValue);
        const personalDetailsExtended = {
            ...personalDetails,
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                login: searchValue,
                avatar: UserUtils.getDefaultAvatar(optimisticAccountID),
            },
        };
        userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, reportActions, {
            showChatPreviewLine,
        });
        userToInvite.isOptimisticAccount = true;
        userToInvite.login = searchValue;
        userToInvite.text = userToInvite.text ?? searchValue;
        userToInvite.alternateText = userToInvite.alternateText ?? searchValue;

        // If user doesn't exist, use a default avatar
        userToInvite.icons = [
            {
                source: UserUtils.getAvatar('', optimisticAccountID),
                name: searchValue,
                type: CONST.ICON_TYPE_AVATAR,
            },
        ];
    }

    // If we are prioritizing 1:1 chats in search, do it only once we started searching
    if (sortByReportTypeInSearch && searchValue !== '') {
        // When sortByReportTypeInSearch is true, recentReports will be returned with all the reports including personalDetailsOptions in the correct Order.
        recentReportOptions.push(...personalDetailsOptions);
        personalDetailsOptions = [];
        recentReportOptions = lodashOrderBy(
            recentReportOptions,
            [
                (option) => {
                    if (option.isChatRoom || option.isArchivedRoom) {
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
            ],
            ['asc'],
        );
    }

    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        userToInvite: canInviteUser ? userToInvite : null,
        currentUserOption,
        categoryOptions: [],
        tagOptions: [],
    };
}

/**
 * Build the options for the Search view
 */
function getSearchOptions(reports: Record<string, Report>, personalDetails: PersonalDetailsCollection, betas: Beta[] = [], searchValue = '') {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        sortByReportTypeInSearch: true,
        showChatPreviewLine: true,
        includePersonalDetails: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
    });
}

/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail: PersonalDetails, amountText: string) {
    const formattedLogin = LocalePhoneNumber.formatPhoneNumber(personalDetail.login ?? '');
    return {
        text: personalDetail.displayName || formattedLogin,
        alternateText: formattedLogin || personalDetail.displayName,
        icons: [
            {
                source: UserUtils.getAvatar(personalDetail.avatar, personalDetail.accountID),
                name: personalDetail.login,
                type: CONST.ICON_TYPE_AVATAR,
                id: personalDetail.accountID,
            },
        ],
        descriptiveText: amountText,
        login: personalDetail.login,
        accountID: personalDetail.accountID,
    };
}

/**
 * Build the IOUConfirmationOptions for showing participants
 */
function getIOUConfirmationOptionsFromParticipants(participants: Option[], amountText: string) {
    return participants.map((participant) => ({
        ...participant,
        descriptiveText: amountText,
    }));
}

/**
 * Build the options for the New Group view
 */
function getFilteredOptions(
    reports: Record<string, Report>,
    personalDetails: PersonalDetailsCollection,
    betas: Beta[] = [],
    searchValue = '',
    selectedOptions = [],
    excludeLogins = [],
    includeOwnedWorkspaceChats = false,
    includeP2P = true,
    includeCategories = false,
    categories = {},
    recentlyUsedCategories = [],
    includeTags = false,
    tags = {},
    recentlyUsedTags = [],
    canInviteUser = true,
) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        selectedOptions,
        includeRecentReports: true,
        includePersonalDetails: true,
        maxRecentReportsToShow: 5,
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
    });
}

/**
 * Build the options for the Share Destination for a Task
 */

function getShareDestinationOptions(
    reports: Record<string, Report>,
    personalDetails: PersonalDetailsCollection,
    betas: Beta[] = [],
    searchValue = '',
    selectedOptions = [],
    excludeLogins = [],
    includeOwnedWorkspaceChats = true,
    excludeUnknownUsers = true,
) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        selectedOptions,
        maxRecentReportsToShow: 0, // Unlimited
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        includePersonalDetails: false,
        showChatPreviewLine: true,
        forcePolicyNamePreview: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        excludeLogins,
        includeOwnedWorkspaceChats,
        excludeUnknownUsers,
    });
}

/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param {Object} member - personalDetails or userToInvite
 * @param {Object} config - keys to overwrite the default values
 * @returns {Object}
 */
function formatMemberForList(member, config = {}) {
    if (!member) {
        return undefined;
    }

    const accountID = lodashGet(member, 'accountID', '');

    return {
        text: lodashGet(member, 'text', '') || lodashGet(member, 'displayName', ''),
        alternateText: lodashGet(member, 'alternateText', '') || lodashGet(member, 'login', ''),
        keyForList: lodashGet(member, 'keyForList', '') || String(accountID),
        isSelected: false,
        isDisabled: false,
        accountID,
        login: member.login ?? '',
        rightElement: null,
        icons: lodashGet(member, 'icons'),
        pendingAction: lodashGet(member, 'pendingAction'),
        ...config,
    };
}

/**
 * Build the options for the Workspace Member Invite view
 */
function getMemberInviteOptions(personalDetails: PersonalDetailsCollection, betas = [], searchValue = '', excludeLogins = []) {
    return getOptions({}, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        includePersonalDetails: true,
        excludeLogins,
        sortPersonalDetailsByAlphaAsc: true,
    });
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions: boolean, hasUserToInvite: boolean, searchValue: string, maxParticipantsReached = false, hasMatchedParticipant = false): string {
    if (maxParticipantsReached) {
        return Localize.translate(preferredLocale, 'common.maxParticipantsReached', {count: CONST.REPORT.MAXIMUM_PARTICIPANTS});
    }

    const isValidPhone = parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible;

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
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option: Option): boolean {
    return Boolean((!option.isChatRoom || option.isThread) && !option.isArchivedRoom);
}

export {
    addSMSDomainIfPhoneNumber,
    getAvatarsForAccountIDs,
    isCurrentUser,
    isPersonalDetailsReady,
    getSearchOptions,
    getFilteredOptions,
    getShareDestinationOptions,
    getMemberInviteOptions,
    getHeaderMessage,
    getPersonalDetailsForAccountIDs,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getSearchText,
    getAllReportErrors,
    getPolicyExpenseReportOption,
    getParticipantsOption,
    isSearchStringMatch,
    shouldOptionShowTooltip,
    getLastMessageTextForReport,
    getEnabledCategoriesCount,
    hasEnabledOptions,
    getCategoryOptionTree,
    formatMemberForList,
};
