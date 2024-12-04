import lodashMapValues from 'lodash/mapValues';
import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxProvider';
import localeCompare from '@libs/LocaleCompare';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import useCurrentReportID from './useCurrentReportID';

type SuggestionPersonalDetailsList = Record<
    string,
    | (PersonalDetails & {
          weight: number;
      })
    | null
>;

function getWeightedPersonalDetailsArray(personalDetails: PersonalDetailsList, currentReport?: OnyxCollection<Report>): PersonalDetailsList[] | SuggestionPersonalDetailsList[] {
    const policyEmployeeAccountIDs = getPolicyEmployeeAccountIDs(currentReport?.policyID);
    if (!ReportUtils.isGroupChat(currentReport) && !ReportUtils.doesReportBelongToWorkspace(currentReport, policyEmployeeAccountIDs, currentReport?.policyID)) {
        return Object.values(personalDetails);
    }

    const newValues = lodashMapValues(personalDetails, (detail) =>
        detail
            ? {
                  ...detail,
                  weight: getPersonalDetailsWeight(detail, currentReport, policyEmployeeAccountIDs),
              }
            : null,
    );

    return Object.values(newValues) as Array<PersonalDetails & {weight: number}>;
}

function getPersonalDetailsWeight(detail: PersonalDetails, currentReport: OnyxCollection<Report>, policyEmployeeAccountIDs: number[]): number {
    if (ReportUtils.isReportParticipant(detail.accountID, currentReport)) {
        return 0;
    }
    if (policyEmployeeAccountIDs.includes(detail.accountID)) {
        return 1;
    }
    return 2;
}

function usePreSortedPersonalDetails() {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const currentReportID = useCurrentReportID();
    const currentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReportID?.currentReportID}`];

    const personalDetails: PersonalDetailsList = usePersonalDetails();

    const weightedPersonalDetails = getWeightedPersonalDetailsArray(personalDetails, currentReport);
    const sortedPersonalDetails = weightedPersonalDetails.sort(compareUserInList);

    return sortedPersonalDetails;
}

/**
 * Comparison function to sort users. It compares weights, display names, and accountIDs in that order
 */
function compareUserInList(first: PersonalDetails & {weight: number}, second: PersonalDetails & {weight: number}) {
    if (first.weight !== second.weight) {
        return first.weight - second.weight;
    }

    const displayNameLoginOrder = localeCompare(getDisplayName(first), getDisplayName(second));
    if (displayNameLoginOrder !== 0) {
        return displayNameLoginOrder;
    }

    return first.accountID - second.accountID;
}

function getDisplayName(details: PersonalDetails) {
    const displayNameFromAccountID = ReportUtils.getDisplayNameForParticipant(details.accountID);
    if (!displayNameFromAccountID) {
        return details.login?.length ? details.login : '';
    }
    return displayNameFromAccountID;
}

export default usePreSortedPersonalDetails;
