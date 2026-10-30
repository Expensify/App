import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin as isPolicyAdminUtil, isPolicyEmployee as isPolicyEmployeeUtil, isPolicyGuest} from '@libs/PolicyUtils';
import {
    getParticipantsList,
    isAnnounceRoom as isAnnounceRoomUtil,
    isChatThread as isChatThreadUtil,
    isConciergeChatReport,
    isDefaultRoom as isDefaultRoomUtil,
    isGroupChat as isGroupChatUtil,
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isPublicRoom as isPublicRoomUtil,
    isSystemChat as isSystemChatUtil,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {pendingChatMembersSelector} from '@selectors/ReportMetaData';
import React from 'react';

type ReportDetailsMenuMembersOrInviteItemProps = {
    reportID: string;
};

function ReportDetailsMenuMembersOrInviteItem({reportID}: ReportDetailsMenuMembersOrInviteItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Users']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingChatMembersSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [personalDetails] = useAllPersonalDetails();

    if (!report) {
        return null;
    }

    const isPolicyAdmin = isPolicyAdminUtil(policy);
    const isPolicyEmployee = isPolicyEmployeeUtil(report.policyID, policy);
    const isPolicyExpenseChat = isPolicyExpenseChatUtil(report);
    const isUserCreatedPolicyRoom = isUserCreatedPolicyRoomUtil(report);
    const isDefaultRoom = isDefaultRoomUtil(report);
    const isChatThread = isChatThreadUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isGroupChat = isGroupChatUtil(report);
    const isGuestAnnounceRoom = isPolicyGuest(policy) && isAnnounceRoomUtil(report);
    const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    const participants = getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);

    // Get the active chat members by filtering out the pending members with delete action
    const activeChatMembers = participants.flatMap((accountID) => {
        const pendingMember = reportMetadata?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        const detail = personalDetails?.[accountID];
        if (!detail) {
            return [];
        }
        return pendingMember?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? accountID : [];
    });

    // The Members page is only shown when:
    // - The report is a thread in a chat report
    // - The report is not a user created room with participants to show i.e. DM, Group Chat, etc
    // - The report is a user created room and the room and the current user is a workspace member i.e. non-workspace members should not see this option.
    if (
        !isGuestAnnounceRoom &&
        (isGroupChat ||
            (isDefaultRoom && isChatThread && isPolicyEmployee) ||
            (!isUserCreatedPolicyRoom && participants.length) ||
            (isUserCreatedPolicyRoom && (isPolicyEmployee || (isChatThread && !isPublicRoomUtil(report))))) &&
        !isConciergeChatReport(report, conciergeReportID) &&
        !isSystemChat &&
        activeChatMembers.length > 0
    ) {
        return (
            <MenuItem
                title={translate('common.members')}
                subtitle={activeChatMembers.length}
                icon={expensifyIcons.Users}
                onPress={() => {
                    if (shouldOpenRoomMembersPage) {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ROOM_MEMBERS.path));
                    } else {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_PARTICIPANTS.path));
                    }
                }}
                isAnonymousAction={false}
                shouldShowRightIcon
                subtitleStyle={[styles.ph2]}
            />
        );
    }

    if (!isGuestAnnounceRoom && ((isUserCreatedPolicyRoom && (!participants.length || !isPolicyEmployee)) || ((isDefaultRoom || isPolicyExpenseChat) && isChatThread && !isPolicyEmployee))) {
        return (
            <MenuItem
                title={translate('common.invite')}
                icon={expensifyIcons.Users}
                onPress={() => {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ROOM_INVITE.path));
                }}
                isAnonymousAction={false}
                shouldShowRightIcon
            />
        );
    }

    return null;
}

export default ReportDetailsMenuMembersOrInviteItem;
