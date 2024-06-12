import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report} from '@src/types/onyx';

type ReportAvatarOnyxProps = {
    report: OnyxEntry<Report>;
    isLoadingApp: OnyxEntry<boolean>;
    policies: OnyxCollection<Policy>;
};

type ReportAvatarProps = ReportAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({report = {} as Report, policies, isLoadingApp = true, route}: ReportAvatarProps) {
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '0'}`];
    let title;
    let avatarURL;
    let fileName;
    // eslint-disable-next-line rulesdir/no-negated-variables
    let shouldShowNotFoundPage;

    const shouldUseGroupChatDraft = !!route.params.isNewGroupChat;

    const [groupChatDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {initWithStoredValues: shouldUseGroupChatDraft});

    if (shouldUseGroupChatDraft) {
        avatarURL = groupChatDraft?.avatarUri ?? undefined;
        fileName = groupChatDraft?.originalFileName ?? undefined;
        // When user enters custom group name, it typically stored in groupChatDraft.reportName
        // If that is null then we will use ReportUtils.getGroupChatName to get the name
        title = groupChatDraft?.reportName ?? ReportUtils.getGroupChatName(groupChatDraft?.participants.map((participant) => participant.accountID) ?? []);
        shouldShowNotFoundPage = !isLoadingApp && !groupChatDraft;
    } else {
        avatarURL = policy ? ReportUtils.getWorkspaceAvatar(report) : report?.avatarUrl;
        // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
        fileName = policy ? policy?.originalFileName ?? policy?.id ?? report?.policyID : report?.originalFileName;
        title = policy ? ReportUtils.getPolicyName(report, false, policy) : ReportUtils.getReportName(report);
        shouldShowNotFoundPage = !isLoadingApp && !report?.reportID;
    }

    return (
        <AttachmentModal
            headerTitle={title}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, 0)}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? ''));
            }}
            isWorkspaceAvatar
            maybeIcon
            originalFileName={fileName}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            isLoading={(!report?.reportID || !policy?.id) && !!isLoadingApp}
        />
    );
}

ReportAvatar.displayName = 'ReportAvatar';

export default withOnyx<ReportAvatarProps, ReportAvatarOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? ''}`,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(ReportAvatar);
