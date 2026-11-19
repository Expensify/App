import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';

import {getReportName} from '@libs/ReportNameUtils';
import {getDefaultGroupAvatar, getPolicyName, getWorkspaceIcon, isGroupChat, isThread, isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserAvatarUtils';

import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';

function ReportAvatarModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.REPORT_AVATAR>) {
    const {reportID, policyID} = route.params;

    const {translate} = useLocalize();
    const defaultAvatars = useDefaultAvatars();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const derivedReportName = useDerivedReportNameByReportID(reportID);

    let attachment: AttachmentModalBaseContentProps;
    if (isGroupChat(report) && !isThread(report)) {
        attachment = {
            source: report?.avatarUrl
                ? getFullSizeAvatar({
                      avatarSource: report.avatarUrl,
                      defaultAvatars,
                  })
                : getDefaultGroupAvatar(report?.reportID),
            headerTitle: getReportName(report, derivedReportName),
            isWorkspaceAvatar: false,
        };
    } else if (isUserCreatedPolicyRoom(report) && report?.avatarUrl) {
        attachment = {
            source: getFullSizeAvatar({
                avatarSource: report.avatarUrl,
                defaultAvatars,
            }),
            headerTitle: getReportName(report, derivedReportName),
            isWorkspaceAvatar: false,
        };
    } else {
        attachment = {
            source: getFullSizeAvatar({
                avatarSource: getWorkspaceIcon(report, translate, policy).source,
                defaultAvatars,
            }),
            headerTitle: getPolicyName({
                report,
                policy,
                unavailableTranslation: translate('workspace.common.unavailable'),
            }),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID,
            isWorkspaceAvatar: true,
        };
    }

    const onDownloadAttachment = useDownloadAttachment();

    const shouldShowNotFoundPage = !report?.reportID && !isLoadingApp;
    const isLoading = (!report?.reportID || !policy?.id) && !!isLoadingApp;

    const contentProps: AttachmentModalBaseContentProps = {
        ...attachment,
        shouldShowNotFoundPage,
        isLoading,
        maybeIcon: true,
        onDownloadAttachment,
        shouldCloseOnSwipeDown: true,
    };

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}

export default ReportAvatarModalContent;
