import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails, useReport} from '@components/OnyxProvider';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Locale, Policy, PolicyMembers, PriorityMode, Report, ReportAction, ReportActions, TransactionViolation} from '@src/types/onyx';
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
    preferredLocale: OnyxEntry<Locale>;
    draftComments: OnyxCollection<string>;
};

type WithOrderedReportListItemsContextProviderProps = OnyxProps & {
    children: React.ReactNode;
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
    preferredLocale,
    draftComments,
}: WithOrderedReportListItemsContextProviderProps) {
    const currentReportIDValue = useCurrentReportID();
    const personalDetails = usePersonalDetails();
    const {canUseViolations} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const policyMemberAccountIDs = useMemo(() => getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, getCurrentUserAccountID()), [activeWorkspaceID, policyMembers]);

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
            ),
        [chatReports, betas, policies, priorityMode, allReportActions, transactionViolations, activeWorkspaceID, policyMemberAccountIDs],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const orderedReportIDsWithCurrentReport = useMemo(() => {
        if (currentReportIDValue?.currentReportID && !orderedReportIDs.includes(currentReportIDValue.currentReportID)) {
            return getOrderedReportIDs(currentReportIDValue.currentReportID);
        }
        return orderedReportIDs;
    }, [getOrderedReportIDs, currentReportIDValue?.currentReportID, orderedReportIDs]);

    const orderedReportListItems = useMemo(
        () =>
            orderedReportIDsWithCurrentReport.map((reportID) => {
                const itemFullReport = chatReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? null;
                const itemReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? null;
                const itemParentReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`] ?? null;
                const itemParentReportAction = itemParentReportActions?.[itemFullReport?.parentReportActionID ?? ''] ?? null;
                const itemPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport?.policyID}`] ?? null;
                const itemComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] ?? '';

                const hasViolations = canUseViolations && ReportUtils.doesTransactionThreadHaveViolations(itemFullReport, transactionViolations, itemParentReportAction ?? null);

                const item = SidebarUtils.getOptionData({
                    report: itemFullReport,
                    reportActions: itemReportActions,
                    personalDetails,
                    preferredLocale: preferredLocale ?? CONST.LOCALES.DEFAULT,
                    policy: itemPolicy,
                    parentReportAction: itemParentReportAction,
                    hasViolations: !!hasViolations,
                });

                return {reportID, optionItem: item, comment: itemComment};
            }),
        [orderedReportIDsWithCurrentReport, canUseViolations, personalDetails, draftComments, preferredLocale, chatReports, allReportActions, policies, transactionViolations],
    );

    return <OrderedReportListItemsContext.Provider value={orderedReportListItems}>{children}</OrderedReportListItemsContext.Provider>;
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
    draftComments: {
        key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        initialValue: {},
    },
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(WithOrderedReportListItemsContextProvider);

function useOrderedReportListItems() {
    return useContext(OrderedReportListItemsContext);
}

export {OrderedReportListItemsContextProvider, OrderedReportListItemsContext, useOrderedReportListItems};
