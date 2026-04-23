import {useRoute} from '@react-navigation/native';
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
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
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
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './SystemChatReportFooterMessage';

const policyRoleSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => policy?.role;

/**
 * Footer component that decides between the composer and
 * archived/anonymous/blocked/system chat/admins-only footer.
 */
function ReportFooter() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- isSmallScreenWidth guards composer visibility on mobile during keyboard events, shouldUseNarrowLayout would wrongly hide it in RHP
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const isAnonymousUser = useIsAnonymousUser();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const [shouldShowComposeInput = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: isBlockedFromChatSelector,
    });
    const [policyRole] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyRoleSelector,
    });
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`);
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });

    const isUserPolicyAdmin = policyRole === CONST.POLICY.ROLE.ADMIN;
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);

    const shouldShowComposerOptimistically = !isAnonymousUser && isPublicRoom(report) && !!isLoadingInitialReportActions;
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = canWriteInReportUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoomUtil(report);

    if (!isCurrentReportLoadedFromOnyx || !report || !reportIDFromRoute) {
        return null;
    }

    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};

    // Happy path — user can compose
    if (!shouldHideComposer && (shouldShowComposeInput || !isSmallScreenWidth)) {
        return (
            <View style={[chatFooterStyles, isComposerFullSize && styles.chatFooterFullCompose]}>
                <SwipeableView onSwipeDown={Keyboard.dismiss}>
                    <ReportActionCompose reportID={reportIDFromRoute} />
                </SwipeableView>
            </View>
        );
    }

    // Archived room
    if (isArchivedRoom) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <ArchivedReportFooter reportID={reportIDFromRoute} />
                {!shouldUseNarrowLayout && (
                    <View style={styles.offlineIndicatorContainer}>
                        <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                    </View>
                )}
            </View>
        );
    }

    // Anonymous user
    if (isAnonymousUser) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <AnonymousReportFooter reportID={reportIDFromRoute} />
                {!shouldUseNarrowLayout && (
                    <View style={styles.offlineIndicatorContainer}>
                        <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                    </View>
                )}
            </View>
        );
    }

    // Blocked from chat
    if (isBlockedFromChat) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <BlockedReportFooter />
                {!shouldUseNarrowLayout && (
                    <View style={styles.offlineIndicatorContainer}>
                        <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                    </View>
                )}
            </View>
        );
    }

    // System chat where user can't write
    if (!canWriteInReport && isSystemChat) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <SystemChatReportFooterMessage />
                {!shouldUseNarrowLayout && (
                    <View style={styles.offlineIndicatorContainer}>
                        <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                    </View>
                )}
            </View>
        );
    }

    // Admins-only room
    if (isAdminsOnlyPostingRoom && !isUserPolicyAdmin) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <Banner
                    containerStyles={[styles.chatFooterBanner]}
                    text={translate('adminOnlyCanPost')}
                    icon={expensifyIcons.Lightbulb}
                    shouldShowIcon
                />
                {!shouldUseNarrowLayout && (
                    <View style={styles.offlineIndicatorContainer}>
                        <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                    </View>
                )}
            </View>
        );
    }

    return null;
}

export default ReportFooter;
