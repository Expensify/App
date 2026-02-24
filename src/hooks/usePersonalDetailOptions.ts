import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {createOptionList} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData, PrivateIsArchivedMap} from '@libs/PersonalDetailOptionsListUtils/types';
import {isOneOnOneChat, isSelfDM} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseFilteredOptionsConfig = {
    /** Whether the hook should be enabled (default: true) */
    enabled?: boolean;
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
        if (!report || !report.participants) {
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
    return mapOnyxCollectionItems(reports, (report) => {
        if (!report) {
            return;
        }

        if (!isOneOnOneChat(report) && !isSelfDM(report)) {
            return;
        }

        return {
            reportID: report.reportID,
            participants: report.participants,
            lastVisibleActionCreated: report.lastVisibleActionCreated,
        };
    });
};

/** Filters the ReportNameValuePairs collection to create a map of reportID to private_isArchived value for the given set of reportIDs. */
const filterRNVPs = (rNVPCollection: OnyxCollection<ReportNameValuePairs>, reportIDsSet: Set<string>): PrivateIsArchivedMap => {
    const map: PrivateIsArchivedMap = {};
    if (rNVPCollection) {
        for (const [key, value] of Object.entries(rNVPCollection)) {
            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '');
            if (reportIDsSet.has(reportID)) {
                map[reportID] = value?.private_isArchived;
            }
        }
    }
    return map;
};

/** Filters the ReportAttributesDerivedValue collection to include only entries for the given set of reportIDs. */
const filterReportAttributes = (reportAttributes: OnyxEntry<ReportAttributesDerivedValue>, reportIDsSet: Set<string>): Record<string, ReportAttributes> => {
    const map: Record<string, ReportAttributes> = {};
    if (reportAttributes?.reports) {
        for (const [reportID, value] of Object.entries(reportAttributes.reports)) {
            if (reportIDsSet.has(reportID)) {
                map[reportID] = value;
            }
        }
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
 *   showLoadingPlaceholder={isLoading}
 * />
 */
function usePersonalDetailOptions(config: UseFilteredOptionsConfig = {}): UseFilteredOptionsResult {
    const {enabled = true, shouldStoreReportErrors = false, shouldShowBrickRoadIndicator = false} = config;

    const {accountID} = useCurrentUserPersonalDetails();
    const {formatPhoneNumber} = useLocalize();
    const [reports, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelector});
    const reportIDsSet = (() => {
        if (!reports) {
            return new Set<string>();
        }
        const validReportIDs = new Set<string>();
        for (const report of Object.values(reports)) {
            if (report) {
                validReportIDs.add(report.reportID);
            }
        }
        return validReportIDs;
    })();

    const [reportAttributes, reportAttributesMetadata] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const personalDetails = usePersonalDetails();

    const isLoading = !enabled || isLoadingOnyxValue(reportsMetadata, reportAttributesMetadata, reportNameValuePairsMetadata);

    const accountIDToReportIDMap = generateAccountIDToReportIDMap(reports, accountID);
    const privateIsArchivedMap = filterRNVPs(reportNameValuePairs, reportIDsSet);
    const filteredReportAttributes = filterReportAttributes(reportAttributes, reportIDsSet);

    const optionsData = !isLoading
        ? createOptionList(accountID, personalDetails, accountIDToReportIDMap, reports, filteredReportAttributes, privateIsArchivedMap, formatPhoneNumber, {
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
