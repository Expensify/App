import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import _ from 'underscore';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy, PolicyMembers, PriorityMode, Report, ReportActions, Transaction, TransactionViolation} from '@src/types/onyx';
import useActiveWorkspace from './useActiveWorkspace';
import useCurrentReportID from './useCurrentReportID';
import usePermissions from './usePermissions';

type OnyxProps = {
    chatReports: OnyxCollection<Report>;
    betas: OnyxEntry<Beta[]>;
    policies: OnyxCollection<Policy>;
    allReportActions: OnyxCollection<ReportActions>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    policyMembers: OnyxCollection<PolicyMembers>;
    priorityMode: OnyxEntry<PriorityMode>;
    allTransactions: OnyxCollection<Transaction>;
};

type WithOrderedReportListItemsContextProviderProps = OnyxProps & {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

const OrderedReportListItemsContext = createContext({});

function WithOrderedReportListItemsContextProvider({
    children,
    chatReports,
    betas,
    policies,
    allReportActions,
    transactionViolations,
    policyMembers,
    priorityMode,
    allTransactions,
    /**
     * Only required to make unit tests work, since we
     * explicitly pass the currentReportID in LHNTestUtils
     * to SidebarLinksData, so this context doesn't have an
     * access to currentReportID in that case.
     *
     * So this is a work around to have currentReportID available
     * only in testing environment.
     */
    currentReportIDForTests,
}: WithOrderedReportListItemsContextProviderProps) {
    const currentReportIDValue = useCurrentReportID();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue?.currentReportID;
    const {activeWorkspaceID} = useActiveWorkspace();
    const {canUseViolations} = usePermissions();

    const policyMemberAccountIDs = useMemo(() => getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, getCurrentUserAccountID()), [activeWorkspaceID, policyMembers]);

    const chatReportsKeys = useMemo(() => _.keys(chatReports), [chatReports]);
    const reportIDsWithErrors = useMemo(() => {
        return _.reduce(
            chatReportsKeys,
            (errorsMap, reportKey) => {
                const report = chatReports && chatReports[reportKey];
                const allReportsActions = allReportActions && allReportActions[reportKey.replace(ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.REPORT_ACTIONS)];
                const errors = OptionsListUtils.getAllReportErrors(report, allReportsActions, allTransactions) || {};
                if (_.size(errors) === 0) {
                    return errorsMap;
                }
                return {...errorsMap, [reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '')]: errors};
            },
            {},
        );
    }, [chatReportsKeys, allReportActions, allTransactions, chatReports]);

    const getOrderedReportIDs = useCallback(
        (currentReportID?: string) =>
            SidebarUtils.getOrderedReportIDs(
                currentReportID ?? null,
                chatReports,
                betas ?? [],
                policies,
                priorityMode,
                allReportActions,
                transactionViolations,
                activeWorkspaceID,
                policyMemberAccountIDs,
                reportIDsWithErrors,
                canUseViolations,
            ),
        [chatReports, betas, policies, priorityMode, allReportActions, transactionViolations, activeWorkspaceID, policyMemberAccountIDs, reportIDsWithErrors, canUseViolations],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
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
            reportIDsWithErrors,
        }),
        [orderedReportIDsWithCurrentReport, reportIDsWithErrors],
    );

    return <OrderedReportListItemsContext.Provider value={contextValue}>{children}</OrderedReportListItemsContext.Provider>;
}

const OrderedReportListItemsContextProvider = withOnyx<WithOrderedReportListItemsContextProviderProps, OnyxProps>({
    chatReports: {
        key: ONYXKEYS.COLLECTION.REPORT,
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
    allTransactions: {
        key: ONYXKEYS.COLLECTION.TRANSACTION,
        initialValue: {},
    },
})(WithOrderedReportListItemsContextProvider);

function useOrderedReportListItems() {
    return useContext(OrderedReportListItemsContext);
}

export {OrderedReportListItemsContextProvider, OrderedReportListItemsContext, useOrderedReportListItems};
