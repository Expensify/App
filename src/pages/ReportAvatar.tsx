import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

type ReportRoute = RouteProp<{params: {reportID: string}}>;

type ReportAvatarOnyxProps = {
    report: OnyxEntry<Report>;
    isLoadingApp: OnyxEntry<boolean>;
    policies: OnyxCollection<Policy>;
};

type ReportAvatarProps = ReportAvatarOnyxProps & {
    // eslint-disable-next-line react/no-unused-prop-types
    route: ReportRoute;
};

function getReportIDFromRoute(route: ReportRoute) {
    return route.params.reportID ?? '';
}

function ReportAvatar({report = {} as Report, policies, isLoadingApp = true}: ReportAvatarProps) {
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '0'}`];
    const isArchivedRoom = ReportUtils.isArchivedRoom(report);
    const policyName = isArchivedRoom ? report?.oldPolicyName : policy?.name;
    const avatarURL = policy?.avatar ?? '' ? policy?.avatar ?? '' : ReportUtils.getDefaultWorkspaceAvatar(policyName);

    return (
        <AttachmentModal
            headerTitle={policyName}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, 0)}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? ''));
            }}
            isWorkspaceAvatar
            originalFileName={policy?.originalFileName ?? policyName}
            shouldShowNotFoundPage={!report?.reportID && !isLoadingApp}
            isLoading={(!report?.reportID || !policy?.id) && isLoadingApp}
        />
    );
}

ReportAvatar.displayName = 'ReportAvatar';

export default withOnyx<ReportAvatarProps, ReportAvatarOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportIDFromRoute(route)}`,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(ReportAvatar);
