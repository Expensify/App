import {usePersonalDetails} from '@components/OnyxListItemProvider';

import {createOptionList, filterPersonalDetailsByLogins} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData, PrivateIsArchivedMap} from '@libs/PersonalDetailOptionsListUtils/types';
import {isOneOnOneChat, isSelfDM} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseFilteredOptionsConfig = {
    /** Whether the hook should be enabled (default: true) */
    enabled?: boolean;
    /** When set, only the personal details whose login is in this set are turned into options */
    includeLoginsOnly?: Set<string>;
    /* Whether to include report errors in the option data (default: false) */
    shouldStoreReportErrors?: boolean;
    /* Whether to include brick road indicator status in the option data (default: false) */
    shouldShowBrickRoadIndicator?: boolean;
};

type UseFilteredOptionsResult = {
    /** The computed options list (personal details) */
    options: OptionData[] | undefined;
    /** The current user option (personal detail) */
    currentOption: OptionData | undefined;
    /** Whether the options are currently being loaded (initial load) */
    isLoading: boolean;
};

const generateAccountIDToReportIDMap = (reports: OnyxCollection<Report>, currentUserAccountID: number) => {
    if (!reports) {
        return {};
    }

    const accountIDToReportIDMap: Record<number, string> = {};
    for (const report of Object.values(reports)) {
        if (!report?.participants) {
            continue;
        }
        // This means it's a self-DM
        if (Object.keys(report.participants).length === 1) {
            accountIDToReportIDMap[currentUserAccountID] = report.reportID;
            continue;
        }
        for (const accountID of Object.keys(report.participants)) {
            if (Number(accountID) === currentUserAccountID) {
                continue;
            }
            accountIDToReportIDMap[Number(accountID)] = report.reportID;
        }
    }
    return accountIDToReportIDMap;
};

const reportsSelector = (reports: OnyxCollection<Report>) => {
    const result: OnyxCollection<Report> = {};
    if (reports) {
        for (const [key, report] of Object.entries(reports)) {
            if (!report || (!isOneOnOneChat(report) && !isSelfDM(report))) {
                continue;
            }
            result[key] = {
                reportID: report.reportID,
                participants: report.participants,
                lastVisibleActionCreated: report.lastVisibleActionCreated,
            };
        }
    }
    return result;
};

const privateIsArchivedSelector = (rNVPCollection: OnyxCollection<ReportNameValuePairs>): PrivateIsArchivedMap => {
    const map: PrivateIsArchivedMap = {};
    if (rNVPCollection) {
        for (const [key, value] of Object.entries(rNVPCollection)) {
            map[key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '')] = !!value?.private_isArchived;
        }
    }
    return map;
};

type FilteredReportAttributes = Record<string, Pick<ReportAttributes, 'reportErrors' | 'brickRoadStatus'>>;

const createReportAttributesSelector =
    (shouldStoreReportErrors: boolean, shouldShowBrickRoadIndicator: boolean) =>
    (reportAttributes: OnyxEntry<ReportAttributesDerivedValue>): FilteredReportAttributes | undefined => {
        if ((!shouldStoreReportErrors && !shouldShowBrickRoadIndicator) || !reportAttributes?.reports) {
            return undefined;
        }
        const map: FilteredReportAttributes = {};
        for (const [reportID, value] of Object.entries(reportAttributes.reports)) {
            map[reportID] = {reportErrors: value.reportErrors, brickRoadStatus: value.brickRoadStatus};
        }
        return map;
    };

/**
 * Hook that provides options list for personal details.
 *
 * Benefits over OptionListContextProvider:
 * - Only computes when screen is mounted and enabled
 * - No background recalculations when screen is not visible
 * - Smart reduced data computation for performance (only necessary data for personal details)
 * - Recalculates only when dependencies change
 *
 * Usage:
 * const {options, isLoading} = usePersonalDetailOptions({
 *   enabled: didScreenTransitionEnd,
 * });
 *
 * <SelectionList
 *   sections={isLoading ? [] : sections}
 *   shouldShowLoadingPlaceholder={isLoading}
 * />
 */
function usePersonalDetailOptions(config: UseFilteredOptionsConfig = {}): UseFilteredOptionsResult {
    const {enabled = true, includeLoginsOnly, shouldStoreReportErrors = false, shouldShowBrickRoadIndicator = false} = config;

    const reportAttributesSelector = createReportAttributesSelector(shouldStoreReportErrors, shouldShowBrickRoadIndicator);

    const {accountID} = useCurrentUserPersonalDetails();
    const {formatPhoneNumber, translate} = useLocalize();
    const [reports, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelector});
    const [reportAttributes, reportAttributesMetadata] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {selector: privateIsArchivedSelector});
    const allPersonalDetails = usePersonalDetails();
    const personalDetails = includeLoginsOnly ? filterPersonalDetailsByLogins(allPersonalDetails, includeLoginsOnly) : allPersonalDetails;

    const isLoading = !enabled || isLoadingOnyxValue(reportsMetadata, reportAttributesMetadata, reportNameValuePairsMetadata);

    const accountIDToReportIDMap = generateAccountIDToReportIDMap(reports, accountID);

    const optionsData = !isLoading
        ? createOptionList(accountID, personalDetails, accountIDToReportIDMap, reports, reportAttributes, reportNameValuePairs ?? {}, formatPhoneNumber, translate, {
              shouldStoreReportErrors,
              shouldShowBrickRoadIndicator,
          })
        : undefined;

    return {
        options: optionsData?.options,
        currentOption: optionsData?.currentUserOption,
        isLoading: !optionsData,
    };
}

export default usePersonalDetailOptions;
