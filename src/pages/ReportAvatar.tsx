import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ReportAvatarOnyxProps = {
    report: OnyxEntry<Report>;
    isLoadingApp: OnyxEntry<boolean>;
    policies: OnyxCollection<Policy>;
};

type ReportAvatarProps = ReportAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({report = {} as Report, route, policies, isLoadingApp = true}: ReportAvatarProps) {
    const policyID = route.params.policyID ?? '-1';
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyName = ReportUtils.getPolicyName(report, false, policy);
    const avatarURL = ReportUtils.getWorkspaceAvatar(report);

    return (
        <AttachmentModal
            headerTitle={policyName}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, 0)}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
            }}
            isWorkspaceAvatar
            maybeIcon
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName={policy?.originalFileName ?? policy?.id ?? report?.policyID}
            shouldShowNotFoundPage={!report?.reportID && !isLoadingApp}
            isLoading={(!report?.reportID || !policy?.id) && !!isLoadingApp}
        />
    );
}

ReportAvatar.displayName = 'ReportAvatar';

export default function ComponentWithOnyx(props: Omit<ReportAvatarProps, keyof ReportAvatarOnyxProps>) {
    const [report, reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.route.params.reportID ?? '-1'}`);
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    if (isLoadingOnyxValue(reportMetadata, isLoadingAppMetadata, policiesMetadata)) {
        return null;
    }

    return (
        <ReportAvatar
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            report={report}
            isLoadingApp={isLoadingApp}
            policies={policies}
        />
    );
}
