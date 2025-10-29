import React, {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {getDefaultGroupAvatar, getPolicyName, getReportName, getWorkspaceIcon, isGroupChat, isThread} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

function ReportAvatarModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.REPORT_AVATAR>) {
    const {reportID, policyID} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});

    const attachment: AttachmentModalBaseContentProps = useMemo(() => {
        if (isGroupChat(report) && !isThread(report)) {
            return {
                source: report?.avatarUrl ? getFullSizeAvatar(report.avatarUrl, 0) : getDefaultGroupAvatar(report?.reportID),
                headerTitle: getReportName(report),
                isWorkspaceAvatar: false,
            };
        }

        return {
            source: getFullSizeAvatar(getWorkspaceIcon(report, policy).source, 0),
            headerTitle: getPolicyName({report, policy}),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID,
            isWorkspaceAvatar: true,
        };
    }, [policy, report]);

    const onDownloadAttachment = useDownloadAttachment();

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !report?.reportID && !isLoadingApp;
    const isLoading = (!report?.reportID || !policy?.id) && !!isLoadingApp;

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            ...attachment,
            shouldShowNotFoundPage,
            isLoading,
            maybeIcon: true,
            onDownloadAttachment,
        }),
        [attachment, shouldShowNotFoundPage, isLoading, onDownloadAttachment],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}
ReportAvatarModalContent.displayName = 'ReportAvatarModalContent';

export default ReportAvatarModalContent;
