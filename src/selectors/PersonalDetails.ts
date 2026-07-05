import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {
    getLoginByAccountID,
    getLoginsByAccountIDs,
    getPersonalDetailsByID,
    getPersonalDetailsListByIDs,
    newGetPersonalDetailsByIDs,
    temporaryGetDisplayNameOrDefault,
} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getPersonalDetailsByID(accountID, personalDetailsList);

const multiPersonalDetailsSelector = (accountIDs: number[] | undefined) => (personalDetails: OnyxEntry<PersonalDetailsList>) => newGetPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsListSelector = (accountIDs: Array<number | undefined> | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getPersonalDetailsListByIDs(accountIDs, personalDetailsList);

const personalDetailsLoginSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginByAccountID(accountID, personalDetailsList);

const personalDetailsLoginsSelector = (accountIDs: number[] | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginsByAccountIDs(accountIDs, personalDetailsList);

const personalDetailsDisplayNameSelector = (accountID: number, translate: LocalizedTranslate) => (personalDetails: OnyxEntry<PersonalDetailsList>) =>
    temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails?.[accountID], translate});

const conciergePersonalDetailSelector = personalDetailsSelector(CONST.ACCOUNT_ID.CONCIERGE);

type DisplayDetails = Pick<PersonalDetails, 'accountID' | 'displayName' | 'login' | 'avatar'>;

/**
 * Creates a selector returning only the display details (name, login, avatar) of the given accounts,
 * so subscribers don't re-render when anything else in the personal details list changes.
 */
const createDisplayDetailsByAccountIDsSelector =
    (accountIDs: number[]) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): Record<number, DisplayDetails> => {
        const result: Record<number, DisplayDetails> = {};
        for (const accountID of accountIDs) {
            const detail = personalDetailsList?.[accountID];
            if (!detail) {
                continue;
            }
            result[accountID] = {
                accountID: detail.accountID,
                displayName: detail.displayName,
                login: detail.login,
                avatar: detail.avatar,
            };
        }
        return result;
    };

const doesPersonalDetailExistSelector =
    (accountID: number | undefined) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): boolean =>
        accountID !== undefined && !!personalDetailsList?.[accountID];

const accountIDToLoginSelector = (reportsToArchive: Report[]) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
    const map: Record<number, string> = {};
    for (const report of reportsToArchive) {
        const {ownerAccountID} = report;
        if (ownerAccountID && ownerAccountID !== CONST.POLICY.OWNER_ACCOUNT_ID_FAKE && personalDetailsList?.[ownerAccountID]?.login) {
            map[ownerAccountID] = personalDetailsList[ownerAccountID].login;
        }
    }
    return map;
};

function isPersonalDetailOptimistic(personalDetail: PersonalDetails | null | undefined): boolean {
    return isEmptyObject(personalDetail) || !!personalDetail?.isOptimisticPersonalDetail;
}

const isOptimisticPersonalDetailSelector =
    (accountID: number) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): boolean => {
        if (!personalDetailsList) {
            return true;
        }
        return isPersonalDetailOptimistic(personalDetailsList[accountID]);
    };

const hasExpensifyGuidesEmailsSelector =
    (participantAccountIDs: number[]) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): boolean =>
        participantAccountIDs.some((accountID) => Str.extractEmailDomain(personalDetailsList?.[accountID]?.login ?? '') === CONST.EMAIL.GUIDES_DOMAIN);

type ReportWithParticipantIDs = {
    reportID: string;
    participantIDs: number[];
};

/**
 * Creates a selector that returns a per-report map of whether participants include Expensify Guides emails.
 * The returned selector only produces a new map when participant logins change, so subscribers
 * are not notified on unrelated personal-details updates.
 */
const createGuidesEmailsByReportSelector = (chatReports: OnyxCollection<Report>) => {
    const reportsWithParticipants: ReportWithParticipantIDs[] = [];
    const allParticipantAccountIDs: number[] = [];
    const accountIDSet = new Set<number>();

    for (const report of Object.values(chatReports ?? {})) {
        if (!report) {
            continue;
        }
        const participantIDs = Object.keys(report.participants ?? {}).map(Number);
        reportsWithParticipants.push({reportID: report.reportID, participantIDs});
        for (const accountID of participantIDs) {
            if (accountIDSet.has(accountID)) {
                continue;
            }
            accountIDSet.add(accountID);
            allParticipantAccountIDs.push(accountID);
        }
    }

    let cachedParticipantLoginsKey = '';
    let cachedGuidesEmailsByReport: Record<string, boolean> = {};

    return (personalDetailsList: OnyxEntry<PersonalDetailsList>): Record<string, boolean> => {
        const participantLoginsKey = allParticipantAccountIDs.map((accountID) => personalDetailsList?.[accountID]?.login ?? '').join('\0');

        if (participantLoginsKey === cachedParticipantLoginsKey) {
            return cachedGuidesEmailsByReport;
        }

        cachedParticipantLoginsKey = participantLoginsKey;
        const map: Record<string, boolean> = {};
        for (const {reportID, participantIDs} of reportsWithParticipants) {
            map[reportID] = participantIDs.some((accountID) => Str.extractEmailDomain(personalDetailsList?.[accountID]?.login ?? '') === CONST.EMAIL.GUIDES_DOMAIN);
        }
        cachedGuidesEmailsByReport = map;
        return map;
    };
};

export {
    personalDetailsSelector,
    multiPersonalDetailsSelector,
    personalDetailsListSelector,
    personalDetailsDisplayNameSelector,
    personalDetailsLoginSelector,
    personalDetailsLoginsSelector,
    conciergePersonalDetailSelector,
    doesPersonalDetailExistSelector,
    accountIDToLoginSelector,
    isOptimisticPersonalDetailSelector,
    createDisplayDetailsByAccountIDsSelector,
    hasExpensifyGuidesEmailsSelector,
    createGuidesEmailsByReportSelector,
};
