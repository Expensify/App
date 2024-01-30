import {deepEqual} from 'fast-equals';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import {withNetwork} from '@components/OnyxProvider';
import withCurrentReportID from '@components/withCurrentReportID';
import withNavigationFocus from '@components/withNavigationFocus';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Network, Policy, Report, ReportAction, ReportActions, TransactionViolation} from '@src/types/onyx';
import SidebarLinks from './SidebarLinks';

type SidebarLinksDataOnyxProps = {
    /** List of reports */
    chatReports: OnyxCollection<Report>;

    allReportActions: OnyxCollection<ReportAction[]>;

    isLoadingApp: OnyxEntry<boolean>;

    priorityMode: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    betas: OnyxEntry<Beta[]>;

    network: OnyxEntry<Network>;

    policies: OnyxCollection<Policy>;

    transactionViolations: OnyxCollection<TransactionViolation[]>;
};

type SidebarLinksDataBaseProps = {
    isFocused?: boolean;

    insets?: EdgeInsets;

    currentReportID?: string;

    onLinkClick: () => void;
} & SidebarLinksDataOnyxProps;

function SidebarLinksData({
    isFocused,
    allReportActions,
    betas,
    chatReports,
    currentReportID,
    insets,
    isLoadingApp,
    onLinkClick,
    policies,
    priorityMode,
    network,
    transactionViolations,
}: SidebarLinksDataBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const prevPriorityMode = usePrevious(priorityMode);

    const reportIDsRef = useRef<string[] | null>(null);
    const isLoading = isLoadingApp;
    const optionListItems = useMemo(() => {
        const reportIDs = SidebarUtils.getOrderedReportIDs(null, chatReports ?? {}, betas, policies, priorityMode, allReportActions, transactionViolations);

        if (deepEqual(reportIDsRef.current, reportIDs)) {
            return reportIDsRef.current;
        }

        // 1. We need to update existing reports only once while loading because they are updated several times during loading and causes this regression: https://github.com/Expensify/App/issues/24596#issuecomment-1681679531
        // 2. If the user is offline, we need to update the reports unconditionally, since the loading of report data might be stuck in this case.
        // 3. Changing priority mode to Most Recent will call OpenApp. If there is an existing reports and the priority mode is updated, we want to immediately update the list instead of waiting the OpenApp request to complete
        if (!isLoading ?? !reportIDsRef.current ?? network?.isOffline ?? (reportIDsRef.current && prevPriorityMode !== priorityMode)) {
            reportIDsRef.current = reportIDs;
        }
        return reportIDsRef.current ?? [];
    }, [allReportActions, betas, chatReports, policies, prevPriorityMode, priorityMode, isLoading, network?.isOffline, transactionViolations]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const optionListItemsWithCurrentReport = useMemo(() => {
        if (currentReportID && !optionListItems?.includes(currentReportID)) {
            return SidebarUtils.getOrderedReportIDs(currentReportID, chatReports ?? {}, betas, policies, priorityMode, allReportActions, transactionViolations);
        }
        return optionListItems;
    }, [currentReportID, optionListItems, chatReports, betas, policies, priorityMode, allReportActions, transactionViolations]);

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string) => currentReportIDRef.current === reportID, []);

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
            />
        </View>
    );
}

SidebarLinksData.displayName = 'SidebarLinksData';

/**
 * This function (and the few below it), narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 */
const chatReportSelector = (report: OnyxEntry<Report>) =>
    report && {
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
    };

const reportActionsSelector = (reportActions: OnyxEntry<ReportActions>) =>
    reportActions &&
    Object.values(reportActions).map((reportAction) => {
        const {reportActionID, parentReportActionID, actionName, errors = []} = reportAction;
        const decision = reportAction?.message?.[0]?.moderationDecision?.decision;

        return {
            reportActionID,
            parentReportActionID,
            actionName,
            errors,
            message: [
                {
                    moderationDecision: {decision},
                },
            ],
        };
    });

const policySelector = (policy: OnyxEntry<Policy>) =>
    policy && {
        type: policy.type,
        name: policy.name,
        avatar: policy.avatar,
    };

export default compose(
    withCurrentReportID,
    withNavigationFocus,
    withNetwork(),
    withOnyx({
        chatReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
            initialValue: {},
        },
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
            selector: (s) => s,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
            initialValue: CONST.PRIORITY_MODE.DEFAULT,
            selector: (s) => s,
        },
        betas: {
            key: ONYXKEYS.BETAS,
            initialValue: [],
            selector: (s) => s,
        },
        allReportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
            initialValue: {},
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
            initialValue: {},
        },
        transactionViolations: {
            key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
            initialValue: {},
            selector: (s) => s,
        },
    }),
)(SidebarLinksData);
