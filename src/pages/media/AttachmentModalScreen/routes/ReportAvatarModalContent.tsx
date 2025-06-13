import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getDefaultGroupAvatar, getPolicyName, getReportName, getWorkspaceIcon, isGroupChat, isThread} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function ReportAvatarModalContent({navigation, route}: AttachmentModalScreenProps) {
    const {reportID, policyID} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true, canBeMissing: true});

    const attachment = useMemo(() => {
        if (isGroupChat(report) && !isThread(report)) {
            return {
                source: report?.avatarUrl ? getFullSizeAvatar(report.avatarUrl, 0) : getDefaultGroupAvatar(report?.reportID),
                headerTitle: getReportName(report),
                isWorkspaceAvatar: false,
            };
        }

        return {
            source: getFullSizeAvatar(getWorkspaceIcon(report).source, 0),
            headerTitle: getPolicyName({report, policy}),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID,
            isWorkspaceAvatar: true,
        };
    }, [policy, report]);

    const contentProps = useMemo(
        () =>
            ({
                ...attachment,
                fallbackRoute: ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID),
                shouldShowNotFoundPage: !report?.reportID && !isLoadingApp,
                isLoading: (!report?.reportID || !policy?.id) && !!isLoadingApp,
            }) satisfies Partial<AttachmentModalBaseContentProps>,
        [attachment, isLoadingApp, policy?.id, report?.reportID, reportID],
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
