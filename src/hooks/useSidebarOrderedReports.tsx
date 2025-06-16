import React, {createContext, useCallback, useContext, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useCurrentReportID from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useResponsiveLayout from './useResponsiveLayout';

type PartialPolicyForSidebar = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'>;

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsContextValue = {
    orderedReports: OnyxTypes.Report[];
    currentReportID: string | undefined;
    policyMemberAccountIDs: number[];
};

const SidebarOrderedReportsContext = createContext<SidebarOrderedReportsContextValue>({
    orderedReports: [],
    currentReportID: '',
    policyMemberAccountIDs: [],
});

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PartialPolicyForSidebar =>
    (policy && {
        type: policy.type,
        name: policy.name,
        avatarURL: policy.avatarURL,
        employeeList: policy.employeeList,
    }) as PartialPolicyForSidebar;

function SidebarOrderedReportsContextProvider({
    children,
    /**
     * Only required to make unit tests work, since we
     * explicitly pass the currentReportID in LHNTestUtils
     * to SidebarLinksData, so this context doesn't have
     * access to currentReportID in that case.
     *
     * This is a workaround to have currentReportID available in testing environment.
     */
    currentReportIDForTests,
}: SidebarOrderedReportsContextProviderProps) {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {initialValue: CONST.PRIORITY_MODE.DEFAULT, canBeMissing: true});
    const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (c) => mapOnyxCollectionItems(c, policySelector), canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [reportsDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {initialValue: {}, canBeMissing: true});
    const draftAmount = Object.keys(reportsDrafts ?? {}).length;
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (value) => value?.reports, canBeMissing: true});

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID} = useCurrentUserPersonalDetails();
    const currentReportIDValue = useCurrentReportID();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue?.currentReportIDFromPath ?? currentReportIDValue?.currentReportID;

    const policyMemberAccountIDs = useMemo(() => getPolicyEmployeeListByIdWithoutCurrentUser(policies, undefined, accountID), [policies, accountID]);

    const getOrderedReportIDs = useCallback(
        (currentReportID?: string) =>
            SidebarUtils.getOrderedReportIDs(currentReportID, chatReports, betas, policies, priorityMode, transactionViolations, reportNameValuePairs, reportAttributes),
        // we need reports draft in deps array to reload the list when a draft is added or removed
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [chatReports, betas, policies, priorityMode, transactionViolations, draftAmount, reportNameValuePairs, reportAttributes],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);

    // Get the actual reports based on the ordered IDs
    const getOrderedReports = useCallback(
        (reportIDs: string[]): OnyxTypes.Report[] => {
            if (!chatReports) {
                return [];
            }
            return reportIDs.map((reportID) => chatReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]).filter(Boolean) as OnyxTypes.Report[];
        },
        [chatReports],
    );

    const orderedReports = useMemo(() => getOrderedReports(orderedReportIDs), [getOrderedReports, orderedReportIDs]);

    const contextValue: SidebarOrderedReportsContextValue = useMemo(() => {
        // We need to make sure the current report is in the list of reports, but we do not want
        // to have to re-generate the list every time the currentReportID changes. To do that
        // we first generate the list as if there was no current report, then we check if
        // the current report is missing from the list, which should very rarely happen. In this
        // case we re-generate the list a 2nd time with the current report included.

        // We also execute the following logic if `shouldUseNarrowLayout` is false because this is
        // requirement for web and desktop. Consider a case, where we have report with expenses and we click on
        // any expense, a new LHN item is added in the list and is visible on web and desktop. But on mobile, we
        // just navigate to the screen with expense details, so there seems no point to execute this logic on mobile.
        if (
            (!shouldUseNarrowLayout || orderedReportIDs.length === 0) &&
            derivedCurrentReportID &&
            derivedCurrentReportID !== '-1' &&
            orderedReportIDs.indexOf(derivedCurrentReportID) === -1
        ) {
            const updatedReportIDs = getOrderedReportIDs(derivedCurrentReportID);
            const updatedReports = getOrderedReports(updatedReportIDs);
            return {
                orderedReports: updatedReports,
                currentReportID: derivedCurrentReportID,
                policyMemberAccountIDs,
            };
        }

        return {
            orderedReports,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
        };
    }, [getOrderedReportIDs, orderedReportIDs, derivedCurrentReportID, policyMemberAccountIDs, shouldUseNarrowLayout, getOrderedReports, orderedReports]);

    return <SidebarOrderedReportsContext.Provider value={contextValue}>{children}</SidebarOrderedReportsContext.Provider>;
}

function useSidebarOrderedReports() {
    return useContext(SidebarOrderedReportsContext);
}

export {SidebarOrderedReportsContext, SidebarOrderedReportsContextProvider, useSidebarOrderedReports};
export type {PartialPolicyForSidebar};
