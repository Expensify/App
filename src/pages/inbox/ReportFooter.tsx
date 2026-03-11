import {useRoute} from '@react-navigation/native';
import {isBlockedFromChatSelector} from '@selectors/BlockedFromChat';
import React, {useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import SwipeableView from '@components/SwipeableView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    canUserPerformWriteAction,
    canWriteInReport as canWriteInReportUtil,
    isAdminsOnlyPostingRoom as isAdminsOnlyPostingRoomUtil,
    isArchivedNonExpenseReport,
    isPublicRoom,
    isSystemChat as isSystemChatUtil,
} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import ReportActionCompose from './report/ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './report/SystemChatReportFooterMessage';

const policyRoleSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => policy?.role;
const isLoadingInitialReportActionsSelector = (reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>) => reportMetadata?.isLoadingInitialReportActions;

/**
 * Self-subscribing footer component that decides between composer,
 * archived, anonymous, blocked, system chat, or admins-only footer.
 */
function ReportFooter() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isInSidePanel = useIsInSidePanel();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const personalDetail = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const isAnonymousUser = useIsAnonymousUser();

    // ReportFooter only subscribes to what it needs for footer variant selection
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const [shouldShowComposeInput = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: isBlockedFromChatSelector,
    });
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`);
    const [policyRole] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyRoleSelector,
    });
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });

    const isUserPolicyAdmin = policyRole === CONST.POLICY.ROLE.ADMIN;
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);

    const isSmallSizeLayout = windowWidth - (shouldUseNarrowLayout ? 0 : variables.sideBarWithLHBWidth) < variables.anonymousReportFooterBreakpoint;

    const shouldShowComposerOptimistically = !isAnonymousUser && isPublicRoom(report) && !!isLoadingInitialReportActions;
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = canWriteInReportUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoomUtil(report);

    const [didHideComposerInput, setDidHideComposerInput] = useState(!shouldShowComposeInput);

    useEffect(() => {
        if (didHideComposerInput || shouldShowComposeInput) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDidHideComposerInput(true);
    }, [shouldShowComposeInput, didHideComposerInput]);

    if (!isCurrentReportLoadedFromOnyx || !report) {
        return null;
    }

    // Happy path — user can compose
    if (!shouldHideComposer && (shouldShowComposeInput || !isSmallScreenWidth)) {
        return (
            <View style={[chatFooterStyles, isComposerFullSize && styles.chatFooterFullCompose]}>
                <SwipeableView onSwipeDown={Keyboard.dismiss}>
                    <ReportActionCompose
                        reportID={report.reportID}
                        isComposerFullSize={isComposerFullSize}
                        didHideComposerInput={didHideComposerInput}
                    />
                </SwipeableView>
            </View>
        );
    }

    // Archived room
    if (isArchivedRoom) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <ArchivedReportFooter
                    report={report}
                    currentUserAccountID={personalDetail.accountID}
                />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // Anonymous user
    if (isAnonymousUser) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <AnonymousReportFooter
                    report={report}
                    isSmallSizeLayout={isSmallSizeLayout || isInSidePanel}
                />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // Blocked from chat
    if (isBlockedFromChat) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <BlockedReportFooter />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // System chat where user can't write
    if (!canWriteInReport && isSystemChat) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <SystemChatReportFooterMessage />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
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
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    return null;
}

export default ReportFooter;
