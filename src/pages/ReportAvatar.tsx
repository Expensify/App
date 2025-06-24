import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getDefaultGroupAvatar, getPolicyName, getReportName, getWorkspaceIcon, isGroupChat, isThread} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportAvatarProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({route}: ReportAvatarProps) {
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
            source: getFullSizeAvatar(getWorkspaceIcon(report, policy).source, 0),
            headerTitle: getPolicyName({report, policy}),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID,
            isWorkspaceAvatar: true,
        };
    }, [report, policy]);

    return (
        <AttachmentModal
            headerTitle={attachment.headerTitle}
            defaultOpen
            source={attachment.source}
            onModalClose={() => {
                Navigation.goBack(report?.reportID ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID) : undefined);
            }}
            isWorkspaceAvatar={attachment.isWorkspaceAvatar}
            maybeIcon
            originalFileName={attachment.originalFileName}
            shouldShowNotFoundPage={!report?.reportID && !isLoadingApp}
            isLoading={(!report?.reportID || !policy?.id) && !!isLoadingApp}
        />
    );
}

ReportAvatar.displayName = 'ReportAvatar';
export default ReportAvatar;
