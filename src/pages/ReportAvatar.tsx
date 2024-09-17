import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportAvatarProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({route}: ReportAvatarProps) {
    const reportIDFromRoute = route.params?.reportID ?? '-1';
    const policyIDFromRoute = route.params?.policyID ?? '-1';
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyIDFromRoute}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});

    const attachment = useMemo(() => {
        if (ReportUtils.isGroupChat(report) && !ReportUtils.isThread(report)) {
            return {
                source: report?.avatarUrl ? UserUtils.getFullSizeAvatar(report.avatarUrl, 0) : ReportUtils.getDefaultGroupAvatar(report?.reportID ?? ''),
                headerTitle: ReportUtils.getReportName(report),
                originalFileName: report?.avatarFileName ?? '',
                isWorkspaceAvatar: false,
            };
        }

        return {
            source: UserUtils.getFullSizeAvatar(ReportUtils.getWorkspaceIcon(report).source, 0),
            headerTitle: ReportUtils.getPolicyName(report, false, policy),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID ?? '',
            isWorkspaceAvatar: true,
        };
    }, [report, policy]);

    return (
        <AttachmentModal
            headerTitle={attachment.headerTitle}
            defaultOpen
            source={attachment.source}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
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
