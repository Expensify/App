import React, {createContext, useCallback, useContext, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import useActiveWorkspace from './useActiveWorkspace';
import useCurrentReportID from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useResponsiveLayout from './useResponsiveLayout';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'>;
type ReportActionsSelector = Array<Pick<OnyxTypes.ReportAction, 'reportActionID' | 'actionName' | 'errors' | 'message' | 'originalMessage'>>;

type ReportIDsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type ReportIDsContextValue = {
    orderedReportIDs: string[];
    currentReportID: string;
    policyMemberAccountIDs: number[];
};

const ReportIDsContext = createContext<ReportIDsContextValue>({
    orderedReportIDs: [],
    currentReportID: '',
    policyMemberAccountIDs: [],
});

/**
 * This function (and the few below it), narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 */
const reportActionsSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>): ReportActionsSelector =>
    (reportActions &&
        Object.values(reportActions)
            .filter(Boolean)
            .map((reportAction) => {
                const {reportActionID, actionName, errors = [], originalMessage} = reportAction;
                const message = ReportActionsUtils.getReportActionMessage(reportAction);
                const decision = message?.moderationDecision?.decision;

                return {
                    reportActionID,
                    actionName,
                    errors,
                    message: [
                        {
                            moderationDecision: {decision},
                        },
                    ] as Message[],
                    originalMessage,
                };
            })) as ReportActionsSelector;

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        name: policy.name,
        avatarURL: policy.avatarURL,
        employeeList: policy.employeeList,
    }) as PolicySelector;

function ReportIDsContextProvider({
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
}: ReportIDsContextProviderProps) {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {initialValue: CONST.PRIORITY_MODE.DEFAULT});
    const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policySelector});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: reportActionsSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportsDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID} = useCurrentUserPersonalDetails();
    const currentReportIDValue = useCurrentReportID();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue?.currentReportID;
    const {activeWorkspaceID} = useActiveWorkspace();

    const policyMemberAccountIDs = useMemo(() => getPolicyEmployeeListByIdWithoutCurrentUser(policies, activeWorkspaceID, accountID), [policies, activeWorkspaceID, accountID]);

    const getOrderedReportIDs = useCallback(
        (currentReportID?: string) =>
            SidebarUtils.getOrderedReportIDs(
                currentReportID ?? null,
                chatReports,
                betas,
                policies,
                priorityMode,
                allReportActions,
                transactionViolations,
                activeWorkspaceID,
                policyMemberAccountIDs,
            ),
        // we need reports draft in deps array for reloading of list when reportsDrafts will change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [chatReports, betas, policies, priorityMode, allReportActions, transactionViolations, activeWorkspaceID, policyMemberAccountIDs, reportsDrafts],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);
    const contextValue: ReportIDsContextValue = useMemo(() => {
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
            return {orderedReportIDs: getOrderedReportIDs(derivedCurrentReportID), currentReportID: derivedCurrentReportID, policyMemberAccountIDs};
        }

        return {
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
        };
    }, [getOrderedReportIDs, orderedReportIDs, derivedCurrentReportID, policyMemberAccountIDs, shouldUseNarrowLayout]);

    return <ReportIDsContext.Provider value={contextValue}>{children}</ReportIDsContext.Provider>;
}

function useReportIDs() {
    return useContext(ReportIDsContext);
}

export {ReportIDsContext, ReportIDsContextProvider, policySelector, useReportIDs};
export type {PolicySelector, ReportActionsSelector};
