import React, {createContext, useContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxProvider';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy, PolicyMembers, ReportAction, ReportActions, TransactionViolation} from '@src/types/onyx';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import useActiveWorkspace from './useActiveWorkspace';
import useCurrentReportID from './useCurrentReportID';
import usePermissions from './usePermissions';
import {useReports} from './useReports';

type OnyxProps = {
    betas: OnyxEntry<Beta[]>;
    policies: OnyxCollection<Policy>;
    allReportActions: OnyxCollection<ReportAction[]>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    policyMembers: OnyxCollection<PolicyMembers>;
    priorityMode: OnyxEntry<PriorityMode>;
};

type WithOrderedReportIDsContextProviderProps = OnyxProps & {
    children: React.ReactNode;
};

const OrderedReportIDsContext = createContext({});

function WithOrderedReportIDsContextProvider(props: WithOrderedReportIDsContextProviderProps) {
    const chatReports = useReports();
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
                chatReports,
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
            chatReports,
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
                chatReports,
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
        chatReports,
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
        selector: (actions) => reportActionsSelector(actions),
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
