import {isBlockedFromChatSelector} from '@selectors/BlockedFromChat';
import React from 'react';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import SwipeableView from '@components/SwipeableView';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    canUserPerformWriteAction,
    canWriteInReport as canWriteInReportUtil,
    isAdminsOnlyPostingRoom as isAdminsOnlyPostingRoomUtil,
    isArchivedNonExpenseReport,
    isPublicRoom,
    isSystemChat as isSystemChatUtil,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import ReportActionCompose from './report/ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './report/SystemChatReportFooterMessage';

const policyRoleSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => policy?.role;
const isLoadingInitialReportActionsSelector = (reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>) => reportMetadata?.isLoadingInitialReportActions;

type ReportFooterProps = {
    /** The ID of the report */
    reportID: string;
};

function ReportFooter({reportID}: ReportFooterProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [shouldShowComposeInput = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const isAnonymousUser = useIsAnonymousUser();
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: isBlockedFromChatSelector,
    });
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const [policyRole] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyRoleSelector,
    });
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const isReportArchived = useReportIsArchived(reportID);

    if (!report) {
        return null;
    }

    const isUserPolicyAdmin = policyRole === CONST.POLICY.ROLE.ADMIN;
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);

    // If a user just signed in and is viewing a public report, optimistically show the composer while loading the report, since they will have write access when the response comes back.
    const shouldShowComposerOptimistically = !isAnonymousUser && isPublicRoom(report) && !!isLoadingInitialReportActions;
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = canWriteInReportUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoomUtil(report);

    return (
        <>
            {!!shouldHideComposer && (
                <View
                    style={[
                        styles.chatFooter,
                        isArchivedRoom || isAnonymousUser || !canWriteInReport || (isAdminsOnlyPostingRoom && !isUserPolicyAdmin) ? styles.mt4 : {},
                        shouldUseNarrowLayout ? styles.mb5 : null,
                    ]}
                >
                    {isAnonymousUser && !isArchivedRoom && <AnonymousReportFooter reportID={reportID} />}
                    {isArchivedRoom && <ArchivedReportFooter reportID={reportID} />}
                    {!isArchivedRoom && !!isBlockedFromChat && <BlockedReportFooter />}
                    {!isAnonymousUser && !canWriteInReport && isSystemChat && <SystemChatReportFooterMessage />}
                    {isAdminsOnlyPostingRoom && !isUserPolicyAdmin && !isArchivedRoom && !isAnonymousUser && !isBlockedFromChat && (
                        <Banner
                            containerStyles={[styles.chatFooterBanner]}
                            text={translate('adminOnlyCanPost')}
                            icon={expensifyIcons.Lightbulb}
                            shouldShowIcon
                        />
                    )}
                    {!shouldUseNarrowLayout && (
                        <View style={styles.offlineIndicatorContainer}>{shouldHideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>
                    )}
                </View>
            )}
            {!shouldHideComposer && (!!shouldShowComposeInput || !isSmallScreenWidth) && (
                <View style={[chatFooterStyles, isComposerFullSize && styles.chatFooterFullCompose]}>
                    <SwipeableView onSwipeDown={Keyboard.dismiss}>
                        <ReportActionCompose reportID={reportID} />
                    </SwipeableView>
                </View>
            )}
        </>
    );
}

export default ReportFooter;
