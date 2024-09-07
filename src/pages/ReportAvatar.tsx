import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import * as FileUtils from '@libs/fileDownload/FileUtils';
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
    newGroupDraft: OnyxEntry<NewGroupChatDraft>;
};

type ReportAvatarProps = ReportAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({report = {} as Report, route, policies, isLoadingApp = true, newGroupDraft}: ReportAvatarProps) {
    const reportIDFromRoute = String(route.params?.reportID || 0);
    const isNewGroupDraftAvatar = reportIDFromRoute === newGroupDraft?.optimisticReportID;

    const policyID = route.params.policyID ?? '-1';
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyName = ReportUtils.getPolicyName(report, true, policy);
    const isPolicyRelatedReport = !!policyName;
    const [shouldShowDefaultGroupAvatar, setShouldShowDefaultGroupAvatar] = useState(false);

    const attachment = useMemo(() => {
        if (isNewGroupDraftAvatar) {
            return {
                source: shouldShowDefaultGroupAvatar ? ReportUtils.getDefaultGroupAvatar(newGroupDraft?.optimisticReportID ?? '') : newGroupDraft?.avatarUri ?? '',
                headerTitle: (newGroupDraft?.reportName ? newGroupDraft?.reportName : ReportUtils.getGroupChatName(newGroupDraft?.participants)) ?? '',
                originalFileName: newGroupDraft?.avatarFileName ?? '',
            };
        }

        if (isPolicyRelatedReport) {
            return {
                source: UserUtils.getFullSizeAvatar(ReportUtils.getWorkspaceAvatar(report), 0),
                headerTitle: policyName,
                originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID ?? '',
            };
        }

        if (ReportUtils.isGroupChat(report)) {
            const rootGroupReport = ReportUtils.getRootParentReport(report);
            const source =
                UserUtils.getFullSizeAvatar(report?.avatarUrl, 0) ??
                UserUtils.getFullSizeAvatar(rootGroupReport?.avatarUrl, 0) ??
                ReportUtils.getDefaultGroupAvatar(ReportUtils.getRootParentReport(report)?.reportID ?? '') ??
                '';
            return {
                source,
                headerTitle: ReportUtils.getReportName(report),
                originalFileName: report?.avatarFileName ?? rootGroupReport?.avatarFileName ?? '',
            };
        }

        return {
            source: UserUtils.getFullSizeAvatar(report?.avatarUrl ?? '', 0),
            headerTitle: ReportUtils.getReportName(report),
            originalFileName: report?.avatarFileName ?? '',
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShowDefaultGroupAvatar, newGroupDraft, report, policy]);

    useEffect(() => {
        const onError = () => {
            setShouldShowDefaultGroupAvatar(true);
        };
        if (isNewGroupDraftAvatar) {
            FileUtils.readFileAsync(newGroupDraft?.avatarUri ?? '', newGroupDraft?.avatarFileName ?? '', () => {}, onError);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const onModalClose = useCallback(() => {
        if (isNewGroupDraftAvatar) {
            Navigation.goBack();
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
            });
        } else {
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
        }
    }, [isNewGroupDraftAvatar, report]);

    return (
        <AttachmentModal
            headerTitle={attachment.headerTitle}
            defaultOpen
            source={attachment.source}
            onModalClose={onModalClose}
            isWorkspaceAvatar={isPolicyRelatedReport && !isNewGroupDraftAvatar}
            maybeIcon
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName={attachment.originalFileName}
            shouldShowNotFoundPage={!isNewGroupDraftAvatar && !report?.reportID && !isLoadingApp}
            isLoading={(!report?.reportID || !policy?.id) && !!isLoadingApp}
        />
    );
}

ReportAvatar.displayName = 'ReportAvatar';

export default withOnyx<ReportAvatarProps, ReportAvatarOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? '-1'}`,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    newGroupDraft: {
        key: ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    },
})(ReportAvatar);
