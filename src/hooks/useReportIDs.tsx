import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import type {PolicySelector} from '@pages/home/sidebar/SidebarLinksData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import useActiveWorkspace from './useActiveWorkspace';
import useCurrentReportID from './useCurrentReportID';

type OnyxProps = {
    /** List of reports */
    chatReports: OnyxCollection<ChatReportSelector>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** The policies which the user has access to */
    policies: OnyxCollection<PolicySelector>;

    /** All report actions for all reports */
    allReportActions: OnyxCollection<ReportActionsSelector>;

    /** All of the transaction violations */
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;

    /** All policy members */
    policyMembers: OnyxCollection<OnyxTypes.PolicyMembers>;

    /** The chat priority mode */
    priorityMode: OnyxTypes.PriorityMode;
};

type WithReportIDsContextProviderProps = OnyxProps & {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type ReportIDsContextValue = {
    orderedReportIDs: string[];
};

const ReportIDsContext = createContext<ReportIDsContextValue>({
    orderedReportIDs: [],
});

function WithReportIDsContextProvider({
    children,
    chatReports,
    betas,
    policies,
    allReportActions,
    transactionViolations,
    policyMembers,
    priorityMode,
    /**
     * Only required to make unit tests work, since we
     * explicitly pass the currentReportID in LHNTestUtils
     * to SidebarLinksData, so this context doesn't have an
     * access to currentReportID in that case.
     *
     * This is a workaround to have currentReportID available in testing environment.
     */
    currentReportIDForTests,
}: WithReportIDsContextProviderProps) {
    const currentReportIDValue = useCurrentReportID();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue?.currentReportID;
    const {activeWorkspaceID} = useActiveWorkspace();

    const policyMemberAccountIDs = useMemo(() => getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, getCurrentUserAccountID()), [activeWorkspaceID, policyMembers]);

    const getOrderedReportIDs = useCallback(
        (currentReportID?: string) =>
            SidebarUtils.getOrderedReportIDs(
                currentReportID ?? null,
                chatReports,
                betas,
                policies as OnyxCollection<OnyxTypes.Policy>,
                priorityMode,
                allReportActions as OnyxCollection<OnyxTypes.ReportAction[]>,
                transactionViolations,
                activeWorkspaceID,
                policyMemberAccountIDs,
            ),
        [chatReports, betas, policies, priorityMode, allReportActions, transactionViolations, activeWorkspaceID, policyMemberAccountIDs],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const orderedReportIDsWithCurrentReport = useMemo(() => {
        if (derivedCurrentReportID && !orderedReportIDs.includes(derivedCurrentReportID)) {
            return getOrderedReportIDs(derivedCurrentReportID);
        }
        return orderedReportIDs;
    }, [getOrderedReportIDs, derivedCurrentReportID, orderedReportIDs]);

    const contextValue = useMemo(
        () => ({
            orderedReportIDs: orderedReportIDsWithCurrentReport,
        }),
        [orderedReportIDsWithCurrentReport],
    );

    return <ReportIDsContext.Provider value={contextValue}>{children}</ReportIDsContext.Provider>;
}

type ChatReportSelector = OnyxTypes.Report & {isUnreadWithMention: boolean};
type ReportActionsSelector = Array<Pick<OnyxTypes.ReportAction, 'reportActionID' | 'actionName' | 'errors' | 'message' | 'originalMessage'>>;

/**
 * This function (and the few below it), narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 */
const chatReportSelector = (report: OnyxEntry<OnyxTypes.Report>): ChatReportSelector =>
    (report && {
        reportID: report.reportID,
        participantAccountIDs: report.participantAccountIDs,
        hasDraft: report.hasDraft,
        isPinned: report.isPinned,
        isHidden: report.isHidden,
        notificationPreference: report.notificationPreference,
        errorFields: {
            addWorkspaceRoom: report.errorFields?.addWorkspaceRoom,
        },
        lastMessageText: report.lastMessageText,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
        iouReportID: report.iouReportID,
        total: report.total,
        nonReimbursableTotal: report.nonReimbursableTotal,
        hasOutstandingChildRequest: report.hasOutstandingChildRequest,
        isWaitingOnBankAccount: report.isWaitingOnBankAccount,
        statusNum: report.statusNum,
        stateNum: report.stateNum,
        chatType: report.chatType,
        type: report.type,
        policyID: report.policyID,
        visibility: report.visibility,
        lastReadTime: report.lastReadTime,
        // Needed for name sorting:
        reportName: report.reportName,
        policyName: report.policyName,
        oldPolicyName: report.oldPolicyName,
        // Other less obvious properites considered for sorting:
        ownerAccountID: report.ownerAccountID,
        currency: report.currency,
        managerID: report.managerID,
        // Other important less obivous properties for filtering:
        parentReportActionID: report.parentReportActionID,
        parentReportID: report.parentReportID,
        isDeletedParentAction: report.isDeletedParentAction,
        isUnreadWithMention: ReportUtils.isUnreadWithMention(report),
    }) as ChatReportSelector;

const reportActionsSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>): ReportActionsSelector =>
    (reportActions &&
        Object.values(reportActions).map((reportAction) => {
            const {reportActionID, actionName, errors = [], originalMessage} = reportAction;
            const decision = reportAction.message?.[0].moderationDecision?.decision;

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
        avatar: policy.avatar,
    }) as PolicySelector;

const ReportIDsContextProvider = withOnyx<WithReportIDsContextProviderProps, OnyxProps>({
    chatReports: {
        key: ONYXKEYS.COLLECTION.REPORT,
        initialValue: {},
        selector: chatReportSelector,
    },
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
        initialValue: CONST.PRIORITY_MODE.DEFAULT,
    },
    betas: {
        key: ONYXKEYS.BETAS,
        initialValue: [],
    },
    allReportActions: {
        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        initialValue: {},
        selector: reportActionsSelector,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        initialValue: {},
        selector: policySelector,
    },
    policyMembers: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        initialValue: {},
    },
})(WithReportIDsContextProvider);

function useReportIDs() {
    return useContext(ReportIDsContext);
}

export {ReportIDsContextProvider, ReportIDsContext, useReportIDs};
