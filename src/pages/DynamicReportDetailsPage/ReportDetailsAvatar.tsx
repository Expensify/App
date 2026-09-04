import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import ReportHeaderAvatars from '@components/ReportHeaderAvatars';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getIcons, getParticipantsList, isChatRoom, isChatThread, isGroupChat, isPolicyExpenseChat, isThread, isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {getAccountIDFromAvatarID} from '@libs/UserAvatarUtils';

import {clearAvatarErrors, updateGroupChatAvatar} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {pendingDeleteMemberAccountIDsSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type ReportDetailsAvatarProps = {
    report: Report;
    policy: OnyxEntry<Policy>;

    /** Fallback report whose avatars are shown when the details page has no report of its own */
    moneyRequestReportID: string | undefined;
};

function ReportDetailsAvatar({report, policy, moneyRequestReportID}: ReportDetailsAvatarProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [pendingDeleteMemberAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {selector: pendingDeleteMemberAccountIDsSelector});
    const isReportArchived = useReportIsArchived(report?.reportID);

    const isChatRoomReport = isChatRoom(report);
    const isThreadReport = isThread(report);
    const isGroupChatReport = isGroupChat(report);

    if (isChatRoomReport && !isThreadReport) {
        const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom(report) || isChatThread(report) || (isPolicyExpenseChat(report) && isPolicyAdmin(policy));
        const participants = getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);
        const icons = getIcons(report, formatPhoneNumber, translate, personalDetails, null, '', -1, policy, undefined, isReportArchived, pendingDeleteMemberAccountIDs);
        return (
            <View style={styles.mb3}>
                <RoomHeaderAvatars
                    icons={icons}
                    report={report}
                    policy={policy}
                    participants={participants}
                    currentUserAccountID={currentUserPersonalDetails.accountID}
                />
            </View>
        );
    }

    if (!isGroupChatReport || isThreadReport) {
        return (
            <View style={styles.mb3}>
                <ReportHeaderAvatars reportID={report?.reportID ?? moneyRequestReportID} />
            </View>
        );
    }

    const icons = getIcons(report, formatPhoneNumber, translate, personalDetails, null, '', -1, policy, undefined, isReportArchived, pendingDeleteMemberAccountIDs);
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

export default ReportDetailsAvatar;
