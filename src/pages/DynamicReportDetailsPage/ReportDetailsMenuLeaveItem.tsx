import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {isPolicyAdmin as isPolicyAdminUtil, isPolicyEmployee as isPolicyEmployeeUtil} from '@libs/PolicyUtils';
import {
    canLeaveChat,
    findLastAccessedReport,
    getParticipantsAccountIDsForDisplay,
    isRootGroupChat as isRootGroupChatUtil,
    isWorkspaceMemberLeavingWorkspaceRoom as isWorkspaceMemberLeavingWorkspaceRoomUtil,
} from '@libs/ReportUtils';

import {leaveGroupChat, leaveRoom} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {pendingChatMembersSelector} from '@selectors/ReportMetaData';
import React from 'react';

type ReportDetailsMenuLeaveItemProps = {
    reportID: string;
};

function ReportDetailsMenuLeaveItem({reportID}: ReportDetailsMenuLeaveItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Exit']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingChatMembersSelector});
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [personalDetails] = useAllPersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const isReportArchived = useReportIsArchived(reportID);
    const {showConfirmModal} = useConfirmModal();

    const shouldShowLeaveButton = canLeaveChat(report, policy, currentUserAccountID, !!reportNameValuePairs?.private_isArchived);

    if (!report || !shouldShowLeaveButton) {
        return null;
    }

    const isPolicyAdmin = isPolicyAdminUtil(policy);
    const isPolicyEmployee = isPolicyEmployeeUtil(report.policyID, policy);
    const isRootGroupChat = isRootGroupChatUtil(report, isReportArchived);

    const leaveChat = () => {
        // Resolve on tap from the module-scoped copies so this large page does not subscribe to whole collections.
        const lastAccessedReportID = findLastAccessedReport(false, guideAccountIDs, false, report.reportID)?.reportID;
        if (isRootGroupChat) {
            leaveGroupChat(
                report,
                quickAction?.chatReportID?.toString() === report.reportID,
                currentUserAccountID,
                conciergeReportID,
                introSelected,
                isSelfTourViewed,
                personalDetails,
                lastAccessedReportID,
            );
            return;
        }

        const isWorkspaceMemberLeavingWorkspaceRoom = isWorkspaceMemberLeavingWorkspaceRoomUtil(report, isPolicyEmployee, isPolicyAdmin);
        leaveRoom(report, currentUserAccountID, conciergeReportID, introSelected, isSelfTourViewed, personalDetails, isWorkspaceMemberLeavingWorkspaceRoom, lastAccessedReportID);
    };

    const showLastMemberLeavingModal = async () => {
        const {action} = await showConfirmModal({
            title: translate('groupChat.lastMemberTitle'),
            prompt: translate('groupChat.lastMemberWarning'),
            confirmText: translate('common.leave'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldHandleNavigationBack: false,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        leaveChat();
    };

    return (
        <MenuItem
            title={translate('common.leave')}
            icon={expensifyIcons.Exit}
            onPress={() => {
                if (getParticipantsAccountIDsForDisplay(report, false, true, false, reportMetadata).length === 1 && isRootGroupChat) {
                    showLastMemberLeavingModal();
                    return;
                }

                leaveChat();
            }}
            isAnonymousAction
        />
    );
}

export default ReportDetailsMenuLeaveItem;
