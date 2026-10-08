import MenuItem from '@components/MenuItem';

import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Permissions from '@libs/Permissions';
import {getTrackExpenseActionableWhisper} from '@libs/ReportActionsUtils';
import {getOriginalReportID, isArchivedNonExpenseReport, isSelfDM as isSelfDMUtil, isTrackExpenseReportNew as isTrackExpenseReportUtil} from '@libs/ReportUtils';
import {getOriginalTransactionWithSplitInfo, isPerDiemRequest, isTimeRequest} from '@libs/TransactionUtils';

import {createDraftTransactionAndNavigateToParticipantSelector} from '@userActions/IOU/StartExpenseFlows';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {billingRestrictionPolicySelector, createFilteredPoliciesInfoSelector, createHasWorkspaceToSubmitToSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React from 'react';

import type {ReportDetailsRequestData} from './types';

import ReportDetailsMenuDebugItem from './ReportDetailsMenuDebugItem';
import ReportDetailsMenuGoToRoomItem from './ReportDetailsMenuGoToRoomItem';
import ReportDetailsMenuGoToWorkspaceItem from './ReportDetailsMenuGoToWorkspaceItem';
import ReportDetailsMenuLeaveItem from './ReportDetailsMenuLeaveItem';
import ReportDetailsMenuMarkAsIncompleteItem from './ReportDetailsMenuMarkAsIncompleteItem';
import ReportDetailsMenuMembersOrInviteItem from './ReportDetailsMenuMembersOrInviteItem';
import ReportDetailsMenuPrivateNotesItem from './ReportDetailsMenuPrivateNotesItem';
import ReportDetailsMenuSettingsItem from './ReportDetailsMenuSettingsItem';

type ReportDetailsMenuItemsProps = {
    reportID: string;
    requestData?: ReportDetailsRequestData;
};

function ReportDetailsMenuItems({reportID, requestData}: ReportDetailsMenuItemsProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Send', 'Folder', 'UserPlus']);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);

    const parentReportAction = useParentReportAction(report);

    const [reportActionsForOriginalReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    // The report from which a tracked expense would be submitted/categorized/shared, and its actions -
    // createDraftTransactionAndNavigateToParticipantSelector uses them to find the linked track-expense action
    const actionReportID = getOriginalReportID(reportID, parentReportAction, reportActionsForOriginalReportID, isOffline);
    const [actionReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${actionReportID}`);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const currentUserEmail = currentUserPersonalDetails?.email;
    const currentUserLogin = currentUserPersonalDetails?.login;
    const currentUserDisplayName = currentUserPersonalDetails?.displayName;
    const currentUserLocalCurrencyCode = currentUserPersonalDetails?.localCurrencyCode;
    const filteredPoliciesInfoSelector = createFilteredPoliciesInfoSelector(currentUserEmail);
    const [filteredPoliciesInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: filteredPoliciesInfoSelector});
    const [preferredPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(preferredPolicyID)}`, {selector: billingRestrictionPolicySelector});
    const isSelfDM = isSelfDMUtil(report);
    const isTrackExpenseReport = isTrackExpenseReportUtil(report, parentReport, parentReportAction);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);
    const hasWorkspaceToSubmitToSelector = createHasWorkspaceToSubmitToSelector(currentUserLogin);
    const [hasWorkspaceToSubmitTo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasWorkspaceToSubmitToSelector});

    if (isSelfDM) {
        return null;
    }

    if (isArchivedRoom) {
        return null;
    }

    let trackExpenseItems: React.ReactNode = null;
    if (isTrackExpenseReport && requestData && !requestData.isDeletedParentAction) {
        const {iouTransactionID, moneyRequestReport, moneyRequestReportActions, iouTransaction, iouOriginalTransaction} = requestData;
        const whisperAction = getTrackExpenseActionableWhisper(iouTransactionID, moneyRequestReport?.reportID, moneyRequestReportActions);
        const actionableWhisperReportActionID = whisperAction?.reportActionID;
        const currentUserLocalCurrency = currentUserLocalCurrencyCode ?? CONST.CURRENCY.USD;
        const {isExpenseSplit: isSelfDMExpenseSplit} = getOriginalTransactionWithSplitInfo(iouTransaction, iouOriginalTransaction);

        let submitItems: React.ReactNode = null;
        // Hide the "Submit it to someone" option for self-DM split expenses when the user isn't a member of any workspace.
        if (!isSelfDMExpenseSplit || hasWorkspaceToSubmitTo) {
            const baseSubmitParams = {
                reportID: actionReportID,
                reportActions: actionReportActions,
                reportActionID: actionableWhisperReportActionID,
                introSelected,
                draftTransactionIDs,
                activePolicy,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                restrictedPreferredPolicy: isRestrictedToPreferredPolicy ? preferredPolicy : undefined,
                transaction: iouTransaction,
                currentUserAccountID,
                currentUserEmail: currentUserEmail ?? '',
                currentUserLocalCurrency,
                filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
                firstPolicy: filteredPoliciesInfo?.firstPolicy,
            };
            // "Submit to someone" splits into two destinations here too, matching the track-expense whisper:
            // submit to an individual ("a friend") or a submit-enabled workspace ("my employer").
            const defaultWorkspaceName = generateDefaultWorkspaceName(currentUserEmail ?? '', currentUserDisplayName, lastWorkspaceNumber, translate);

            submitItems = (
                <>
                    {/* Self-DM split expenses can only be submitted to a workspace, so the "a friend" destination is omitted here
                    just like it is on the track-expense whisper. A DM is not a valid destination for per diem and time expenses,
                    nor for a user restricted to one workspace. */}
                    {!isSelfDMExpenseSplit && !isRestrictedToPreferredPolicy && !isPerDiemRequest(iouTransaction) && !isTimeRequest(iouTransaction) && (
                        <MenuItem
                            title={translate('actionableMentionTrackExpense.submitToFriend')}
                            icon={expensifyIcons.Send}
                            onPress={() => {
                                createDraftTransactionAndNavigateToParticipantSelector({
                                    ...baseSubmitParams,
                                    actionName: CONST.IOU.ACTION.SUBMIT,
                                    submitDestination: CONST.IOU.SUBMIT_DESTINATION.FRIEND,
                                    defaultWorkspaceName,
                                });
                            }}
                            isAnonymousAction={false}
                            shouldShowRightIcon
                        />
                    )}
                    <MenuItem
                        title={translate('actionableMentionTrackExpense.submitToEmployer')}
                        icon={expensifyIcons.Send}
                        onPress={() => {
                            createDraftTransactionAndNavigateToParticipantSelector({
                                ...baseSubmitParams,
                                actionName: CONST.IOU.ACTION.SUBMIT,
                                submitDestination: CONST.IOU.SUBMIT_DESTINATION.EMPLOYER,
                                defaultWorkspaceName,
                            });
                        }}
                        isAnonymousAction={false}
                        shouldShowRightIcon
                    />
                </>
            );
        }

        trackExpenseItems = (
            <>
                {submitItems}
                {Permissions.canUseTrackFlows() && (
                    <>
                        <MenuItem
                            title={translate('actionableMentionTrackExpense.categorize')}
                            icon={expensifyIcons.Folder}
                            onPress={() => {
                                createDraftTransactionAndNavigateToParticipantSelector({
                                    reportID: actionReportID,
                                    reportActions: actionReportActions,
                                    actionName: CONST.IOU.ACTION.CATEGORIZE,
                                    reportActionID: actionableWhisperReportActionID,
                                    introSelected,
                                    draftTransactionIDs,
                                    activePolicy,
                                    userBillingGracePeriodEnds,
                                    amountOwed,
                                    ownerBillingGracePeriodEnd,
                                    transaction: iouTransaction,
                                    currentUserAccountID,
                                    currentUserEmail: currentUserEmail ?? '',
                                    currentUserLocalCurrency,
                                    filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
                                    firstPolicy: filteredPoliciesInfo?.firstPolicy,
                                });
                            }}
                            isAnonymousAction={false}
                            shouldShowRightIcon
                        />
                        <MenuItem
                            title={translate('actionableMentionTrackExpense.share')}
                            icon={expensifyIcons.UserPlus}
                            onPress={() => {
                                createDraftTransactionAndNavigateToParticipantSelector({
                                    reportID: actionReportID,
                                    reportActions: actionReportActions,
                                    actionName: CONST.IOU.ACTION.SHARE,
                                    reportActionID: actionableWhisperReportActionID,
                                    introSelected,
                                    draftTransactionIDs,
                                    activePolicy,
                                    userBillingGracePeriodEnds,
                                    amountOwed,
                                    ownerBillingGracePeriodEnd,
                                    transaction: iouTransaction,
                                    currentUserAccountID,
                                    currentUserEmail: currentUserEmail ?? '',
                                    currentUserLocalCurrency,
                                    filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
                                    firstPolicy: filteredPoliciesInfo?.firstPolicy,
                                });
                            }}
                            isAnonymousAction={false}
                            shouldShowRightIcon
                        />
                    </>
                )}
            </>
        );
    }

    return (
        <>
            <ReportDetailsMenuGoToRoomItem reportID={reportID} />
            <ReportDetailsMenuMembersOrInviteItem reportID={reportID} />
            <ReportDetailsMenuSettingsItem reportID={reportID} />
            {trackExpenseItems}
            <ReportDetailsMenuPrivateNotesItem reportID={reportID} />
            <ReportDetailsMenuMarkAsIncompleteItem reportID={reportID} />
            <ReportDetailsMenuGoToWorkspaceItem reportID={reportID} />
            <ReportDetailsMenuLeaveItem reportID={reportID} />
            <ReportDetailsMenuDebugItem reportID={reportID} />
        </>
    );
}

export default ReportDetailsMenuItems;
