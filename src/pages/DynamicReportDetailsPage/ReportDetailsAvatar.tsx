import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import ReportHeaderAvatars from '@components/ReportHeaderAvatars';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin as isPolicyAdminUtil} from '@libs/PolicyUtils';
import {
    getIcons,
    getParticipantsList,
    isChatRoom as isChatRoomUtil,
    isChatThread as isChatThreadUtil,
    isGroupChat as isGroupChatUtil,
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isThread as isThreadUtil,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
} from '@libs/ReportUtils';
import {getAccountIDFromAvatarID} from '@libs/UserAvatarUtils';

import {clearAvatarErrors, updateGroupChatAvatar} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {pendingDeleteMemberAccountIDsSelector} from '@src/selectors/ReportMetaData';
import type {Report} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ReportDetailsAvatarProps = {
    reportID: string;
};

type ReportDetailsAvatarContentProps = {
    report: Report;
};

function ReportDetailsAvatarContent({report}: ReportDetailsAvatarContentProps) {
    const reportID = report.reportID;
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [pendingDeleteMemberAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingDeleteMemberAccountIDsSelector});
    const [personalDetails] = useAllPersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const isReportArchived = useReportIsArchived(reportID);

    const isPolicyAdmin = isPolicyAdminUtil(policy);
    const isPolicyExpenseChat = isPolicyExpenseChatUtil(report);
    const isChatRoom = isChatRoomUtil(report);
    const isUserCreatedPolicyRoom = isUserCreatedPolicyRoomUtil(report);
    const isChatThread = isChatThreadUtil(report);
    const isGroupChat = isGroupChatUtil(report);
    const isThread = isThreadUtil(report);
    const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    const participants = getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);

    const icons = getIcons(report, formatPhoneNumber, translate, personalDetails, null, '', -1, policy, undefined, isReportArchived, pendingDeleteMemberAccountIDs, conciergeReportID);

    if (isChatRoom && !isThread) {
        return (
            <View style={styles.mb3}>
                <RoomHeaderAvatars
                    icons={icons}
                    report={report}
                    policy={policy}
                    participants={participants}
                    currentUserAccountID={currentUserAccountID}
                />
            </View>
        );
    }
    if (!isGroupChat || isThread) {
        return (
            <View style={styles.mb3}>
                <ReportHeaderAvatars reportID={report.reportID} />
            </View>
        );
    }

    const groupChatIcon = icons.at(0);
    const groupChatAvatarSource = groupChatIcon?.source;
    const groupChatAvatar = groupChatAvatarSource ? (
        <UserAvatar
            source={groupChatAvatarSource}
            size={CONST.AVATAR_SIZE.XXXX_LARGE}
            accountID={getAccountIDFromAvatarID(groupChatIcon?.id)}
            fallbackIcon={groupChatIcon?.fallbackIcon}
        />
    ) : null;

    return (
        <AvatarWithImagePicker
            source={groupChatAvatarSource}
            avatar={groupChatAvatar}
            isUsingDefaultAvatar={!report.avatarUrl}
            onViewPhotoPress={() => Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report.reportID))}
            onImageRemoved={() => {
                // Calling this without a file will remove the avatar
                updateGroupChatAvatar(report.reportID, report.avatarUrl);
            }}
            onImageSelected={(file) => updateGroupChatAvatar(report.reportID, report.avatarUrl, file)}
            editIcon={expensifyIcons.Camera}
            editIconStyle={styles.smallEditIconAccount}
            pendingAction={report.pendingFields?.avatar ?? undefined}
            errors={report.errorFields?.avatar ?? null}
            errorRowStyles={styles.mt6}
            onErrorClose={() => clearAvatarErrors(report.reportID)}
            style={[styles.w100, styles.mb3]}
        />
    );
}

function ReportDetailsAvatar({reportID}: ReportDetailsAvatarProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    if (!report?.reportID) {
        return null;
    }

    return <ReportDetailsAvatarContent report={report} />;
}

export default ReportDetailsAvatar;
