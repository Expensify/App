import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import withCurrentReportID from '@components/withCurrentReportID';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import SidebarLinks from './SidebarLinks';

type ChatReportSelector = OnyxTypes.Report & {isUnreadWithMention: boolean};
type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatar'>;
type TransactionSelector = Pick<
    OnyxTypes.Transaction,
    'reportID' | 'iouRequestType' | 'comment' | 'receipt' | 'merchant' | 'modifiedMerchant' | 'created' | 'modifiedCreated' | 'amount' | 'modifiedAmount'
>;
type ReportActionsSelector = Array<Pick<OnyxTypes.ReportAction, 'reportActionID' | 'actionName' | 'errors' | 'message' | 'originalMessage'>>;

type SidebarLinksDataOnyxProps = {
    /** List of reports */
    chatReports: OnyxCollection<ChatReportSelector>;

    /** Wheather the reports are loading. When false it means they are ready to be used. */
    isLoadingApp: OnyxEntry<boolean>;

    /** The chat priority mode */
    priorityMode: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** All transactions f */
    allTransactions: OnyxCollection<TransactionSelector>;

    /** All report actions for all reports */
    allReportActions: OnyxEntry<ReportActionsSelector>;

    /** The policies which the user has access to */
    policies: OnyxCollection<PolicySelector>;

    /** All of the transaction violations */
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;

    /** All policy members */
    policyMembers: OnyxCollection<OnyxTypes.PolicyMembers>;
};

type SidebarLinksDataProps = CurrentReportIDContextValue &
    SidebarLinksDataOnyxProps & {
        /** Toggles the navigation menu open and closed */
        onLinkClick: () => void;

        /** Safe area insets required for mobile devices margins */
        insets: EdgeInsets;
    };

function SidebarLinksData({
    allReportActions,
    allTransactions,
    betas,
    chatReports,
    insets,
    isLoadingApp = true,
    onLinkClick,
    policies,
    priorityMode = CONST.PRIORITY_MODE.DEFAULT,
    policyMembers,
    transactionViolations,
    currentReportID,
}: SidebarLinksDataProps) {
    console.log(allReportActions);
    const {accountID} = useCurrentUserPersonalDetails();
    const network = useNetwork();
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();
    const prevPriorityMode = usePrevious(priorityMode);
    const {canUseViolations} = usePermissions();

    const policyMemberAccountIDs = getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, accountID);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => Policy.openWorkspace(activeWorkspaceID ?? '', policyMemberAccountIDs), [activeWorkspaceID]);

    const reportIDsWithErrors = useMemo(() => {
        const reportKeys = Object.keys(chatReports ?? {});
        return reportKeys.reduce((errorsMap, reportKey) => {
            const report = chatReports?.[reportKey] ?? null;
            const allReportsActions = allReportActions?.[reportKey.replace(ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.REPORT_ACTIONS)];
            const errors = OptionsListUtils.getAllReportErrors(report, allReportsActions, allTransactions as OnyxCollection<OnyxTypes.Transaction>) || {};
            if (Object.keys(errors).length === 0) {
                return errorsMap;
            }
            return {...errorsMap, [reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '')]: errors};
        }, {});
    }, [allReportActions, allTransactions, chatReports]);

    const reportIDsRef = useRef<string[] | null>(null);
    const isLoading = isLoadingApp;
    const optionListItems: string[] = useMemo(() => {
        const reportIDs = SidebarUtils.getOrderedReportIDs(
            null,
            chatReports as OnyxEntry<Record<string, OnyxTypes.Report>>,
            betas,
            policies as OnyxEntry<Record<string, OnyxTypes.Policy>>,
            priorityMode,
            allReportActions as OnyxCollection<OnyxTypes.ReportAction[]>,
            transactionViolations,
            activeWorkspaceID,
            policyMemberAccountIDs,
            reportIDsWithErrors,
            canUseViolations,
        );

        if (reportIDsRef.current && deepEqual(reportIDsRef.current, reportIDs)) {
            return reportIDsRef.current;
        }

        // 1. We need to update existing reports only once while loading because they are updated several times during loading and causes this regression: https://github.com/Expensify/App/issues/24596#issuecomment-1681679531
        // 2. If the user is offline, we need to update the reports unconditionally, since the loading of report data might be stuck in this case.
        // 3. Changing priority mode to Most Recent will call OpenApp. If there is an existing reports and the priority mode is updated, we want to immediately update the list instead of waiting the OpenApp request to complete
        if (!isLoading || !reportIDsRef.current || !!network.isOffline || (reportIDsRef.current && prevPriorityMode !== priorityMode)) {
            reportIDsRef.current = reportIDs;
        }
        return reportIDsRef.current || [];
    }, [
        chatReports,
        betas,
        policies,
        priorityMode,
        allReportActions,
        transactionViolations,
        activeWorkspaceID,
        policyMemberAccountIDs,
        reportIDsWithErrors,
        canUseViolations,
        isLoading,
        network.isOffline,
        prevPriorityMode,
    ]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const optionListItemsWithCurrentReport = useMemo(() => {
        if (currentReportID && !optionListItems?.includes(currentReportID)) {
            return SidebarUtils.getOrderedReportIDs(
                currentReportID,
                chatReports as OnyxEntry<Record<string, OnyxTypes.Report>>,
                betas,
                policies as OnyxEntry<Record<string, OnyxTypes.Policy>>,
                priorityMode,
                allReportActions as OnyxCollection<OnyxTypes.ReportAction[]>,
                transactionViolations,
                activeWorkspaceID,
                policyMemberAccountIDs,
                reportIDsWithErrors,
                canUseViolations,
            );
        }
        return optionListItems;
    }, [
        currentReportID,
        optionListItems,
        chatReports,
        betas,
        policies,
        priorityMode,
        allReportActions,
        transactionViolations,
        activeWorkspaceID,
        policyMemberAccountIDs,
        reportIDsWithErrors,
        canUseViolations,
    ]);

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string): boolean => currentReportIDRef.current === reportID, []);

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
        >
            <SidebarLinks
                // Forwarded props:
                onLinkClick={onLinkClick}
                insets={insets}
                priorityMode={priorityMode}
                // Data props:
                isActiveReport={isActiveReport}
                isLoading={isLoading}
                optionListItems={optionListItemsWithCurrentReport}
                activeWorkspaceID={activeWorkspaceID}
                reportIDsWithErrors={reportIDsWithErrors}
            />
        </View>
    );
}

SidebarLinksData.displayName = 'SidebarLinksData';

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

const reportActionsSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) =>
    reportActions &&
    Object.values(reportActions).map((reportAction) => {
        const {reportActionID, actionName, errors, originalMessage} = reportAction;
        const decision = reportAction.message?.[0].moderationDecision?.decision;

        return {
            reportActionID,
            actionName,
            errors,
            message: [
                {
                    moderationDecision: {decision},
                } as Message,
            ],
            originalMessage,
        };
    });

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        name: policy.name,
        avatar: policy.avatar,
    }) as PolicySelector;

const transactionSelector = (transaction: OnyxEntry<OnyxTypes.Transaction>): TransactionSelector =>
    (transaction && {
        reportID: transaction.reportID,
        iouRequestType: transaction.iouRequestType,
        comment: transaction.comment,
        receipt: transaction.receipt,
        merchant: transaction.merchant,
        modifiedMerchant: transaction.modifiedMerchant,
        amount: transaction.amount,
        modifiedAmount: transaction.modifiedAmount,
        created: transaction.created,
        modifiedCreated: transaction.modifiedCreated,
    }) as TransactionSelector;

export default withCurrentReportID(
    withOnyx<SidebarLinksDataProps, SidebarLinksDataOnyxProps>({
        chatReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
            initialValue: {},
        },
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
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
            selector: reportActionsSelector,
            initialValue: {},
        },
        allTransactions: {
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            selector: transactionSelector,
            initialValue: {},
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
            initialValue: {},
        },
        policyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
        transactionViolations: {
            key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
            initialValue: {},
        },
    })(SidebarLinksData),
);

export type {PolicySelector};
