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
import type {NewGroupChatDraft, Policy, Report} from '@src/types/onyx';

type ReportAvatarOnyxProps = {
    report: OnyxEntry<Report>;
    isLoadingApp: OnyxEntry<boolean>;
    policies: OnyxCollection<Policy>;
    groupChatDraft: OnyxEntry<NewGroupChatDraft>;
};

type ReportAvatarProps = ReportAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({report = {} as Report, policies, isLoadingApp = true, groupChatDraft, route}: ReportAvatarProps) {
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '0'}`];
    const title = policy ? ReportUtils.getPolicyName(report, false, policy) : report?.reportName;
    let avatarURL = undefined;
    let fileName = undefined;

    const shouldUseGroupChatDraft = route.params.newGroupChat === 'true';
    if(shouldUseGroupChatDraft) {
        const [groupChatDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT);
        avatarURL = groupChatDraft?.avatarUri ?? undefined;
        fileName = groupChatDraft?.originalFileName ?? undefined;
    }
    else {
        avatarURL = policy ? ReportUtils.getWorkspaceAvatar(report) : report?.avatarUrl;
        fileName = policy?.originalFileName ?? title;
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
            shouldShowNotFoundPage={!report?.reportID && !groupChatDraft && !isLoadingApp}
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
    groupChatDraft: {
        key: ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    },
})(ReportAvatar);
