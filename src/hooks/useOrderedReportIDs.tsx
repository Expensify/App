import React, {createContext, useContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxProvider';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Locale, Policy, PolicyMembers, Report, ReportAction, ReportActions, TransactionViolation} from '@src/types/onyx';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import useActiveWorkspace from './useActiveWorkspace';
import useCurrentReportID from './useCurrentReportID';
import usePermissions from './usePermissions';

type OnyxProps = {
    chatReports: OnyxCollection<Report>;
    betas: OnyxEntry<Beta[]>;
    policies: OnyxCollection<Policy>;
    allReportActions: OnyxCollection<ReportAction[]>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    policyMembers: OnyxCollection<PolicyMembers>;
    priorityMode: OnyxEntry<PriorityMode>;
    preferredLocale: OnyxEntry<Locale>;
    draftComments: OnyxCollection<string>;
};

type WithOrderedReportIDsContextProviderProps = OnyxProps & {
    children: React.ReactNode;
};

const OrderedReportIDsContext = createContext({});

function WithOrderedReportIDsContextProvider(props: WithOrderedReportIDsContextProviderProps) {
    const currentReportIDValue = useCurrentReportID();
    const {activeWorkspaceID} = useActiveWorkspace();
    const personalDetails = usePersonalDetails();
    const {canUseViolations} = usePermissions();

    const policyMemberAccountIDs = useMemo(
        () => getPolicyMembersByIdWithoutCurrentUser(props.policyMembers, activeWorkspaceID, getCurrentUserAccountID()),
        [activeWorkspaceID, props.policyMembers],
    );

    const optionListItems = useMemo(
        () =>
            SidebarUtils.getOrderedReportIDs(
                null,
                props.chatReports,
                props.betas ?? [],
                props.policies,
                props.priorityMode,
                props.allReportActions,
                props.transactionViolations,
                activeWorkspaceID,
                policyMemberAccountIDs,
                personalDetails,
                props.preferredLocale,
                canUseViolations,
                props.draftComments,
            ),
        [
            props.chatReports,
            props.betas,
            props.policies,
            props.priorityMode,
            props.allReportActions,
            props.transactionViolations,
            activeWorkspaceID,
            policyMemberAccountIDs,
            personalDetails,
            props.preferredLocale,
            canUseViolations,
            props.draftComments,
        ],
    );

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const optionListItemsWithCurrentReport = useMemo(() => {
        if (currentReportIDValue?.currentReportID && !optionListItems.includes(currentReportIDValue.currentReportID)) {
            return SidebarUtils.getOrderedReportIDs(
                currentReportIDValue.currentReportID,
                props.chatReports,
                props.betas ?? [],
                props.policies,
                props.priorityMode,
                props.allReportActions,
                props.transactionViolations,
                activeWorkspaceID,
                policyMemberAccountIDs,
                personalDetails,
                props.preferredLocale,
                canUseViolations,
                props.draftComments,
            );
        }
        return optionListItems;
    }, [
        activeWorkspaceID,
        props.chatReports,
        currentReportIDValue?.currentReportID,
        optionListItems,
        policyMemberAccountIDs,
        props.allReportActions,
        props.betas,
        props.policies,
        props.priorityMode,
        props.transactionViolations,
        personalDetails,
        props.preferredLocale,
        canUseViolations,
        props.draftComments,
    ]);

    return <OrderedReportIDsContext.Provider value={optionListItemsWithCurrentReport}>{props.children}</OrderedReportIDsContext.Provider>;
}

/**
 * This function (and the few below it), narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 * @param {Object} [report]
 * @returns {Object|undefined}
 */
const chatReportSelector = (report) =>
    report && {
        reportID: report.reportID,
        participantAccountIDs: report.participantAccountIDs,
        hasDraft: report.hasDraft,
        isPinned: report.isPinned,
        isHidden: report.isHidden,
        notificationPreference: report.notificationPreference,
        errorFields: {
            addWorkspaceRoom: report.errorFields && report.errorFields.addWorkspaceRoom,
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
    };

const reportActionsSelector = (reportActions: OnyxEntry<ReportActions>) => {
    if (!reportActions) {
        return [];
    }

    return Object.values(reportActions).map((reportAction) => {
        const {reportActionID, actionName, originalMessage} = reportAction ?? {};
        const decision = reportAction?.message?.[0]?.moderationDecision?.decision;
        return {
            reportActionID,
            actionName,
            originalMessage,
            message: [
                {
                    moderationDecision: {decision},
                },
            ],
        };
    });
};

const OrderedReportIDsContextProvider = withOnyx<WithOrderedReportIDsContextProviderProps, OnyxProps>({
    chatReports: {
        key: ONYXKEYS.COLLECTION.REPORT,
        selector: chatReportSelector,
        initialValue: {},
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
        // @ts-expect-error Need some help in determining the correct type for this selector
        selector: reportActionsSelector,
        initialValue: {},
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        initialValue: {},
    },
    policyMembers: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        initialValue: {},
    },
    draftComments: {
        key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        initialValue: {},
    },
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(WithOrderedReportIDsContextProvider);

function useOrderedReportIDs() {
    return useContext(OrderedReportIDsContext);
}

export {OrderedReportIDsContextProvider, OrderedReportIDsContext, useOrderedReportIDs};
