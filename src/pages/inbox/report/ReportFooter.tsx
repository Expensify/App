import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';

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

import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import {isBlockedFromChatSelector} from '@selectors/BlockedFromChat';
import {useState, useCallback} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import EnableNotificationsBanner, {BANNER_COMPOSER_OVERLAP_PX} from './EnableNotificationsBanner';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './SystemChatReportFooterMessage';
import useReportFooterStyles from './useReportFooterStyles';
import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';
import useShouldShowEnableNotificationsBanner from './useShouldShowEnableNotificationsBanner';

const policyRoleSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => policy?.role;

const composerOverlapStyle = {marginTop: -BANNER_COMPOSER_OVERLAP_PX};

type ReportFooterProps = {
    /** The native ID for this component */
    nativeID?: string;

    /** Callback when layout of composer changes */
    onLayout: (height: number) => void;

    /** The current fixed header height of the chat */
    headerHeight: number;
};

/**
 * Footer component that decides between the composer and
 * archived/anonymous/blocked/system chat/admins-only footer.
 */
function ReportFooter({nativeID, onLayout, headerHeight}: ReportFooterProps) {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [composerHeight, setComposerHeight] = useState<number>(CONST.CHAT_FOOTER_MIN_HEIGHT);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`);
    const reportFooterStyles = useReportFooterStyles({composerHeight, headerHeight, isComposerFullSize});

    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const isAnonymousUser = useIsAnonymousUser();
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: isBlockedFromChatSelector,
    });
    const [policyRole] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyRoleSelector,
    });
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });

    const isUserPolicyAdmin = policyRole === CONST.POLICY.ROLE.ADMIN;
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);
    const shouldShowEnableNotificationsBanner = useShouldShowEnableNotificationsBanner(report);

    const shouldShowComposerOptimistically = !isAnonymousUser && isPublicRoom(report) && !!isLoadingInitialReportActions;
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = canWriteInReportUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoomUtil(report);
    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();

    const onLayoutInternal = useCallback(
        (event: LayoutChangeEvent) => {
            const {height} = event.nativeEvent.layout;

            setComposerHeight(height);
            onLayout(height);
        },
        [onLayout],
    );

    if (!isCurrentReportLoadedFromOnyx || !report || !reportIDFromRoute) {
        return null;
    }

    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};

    // Happy path — user can compose
    if (!shouldHideComposer) {
        const composer = (
            <ReportActionCompose
                reportID={reportIDFromRoute}
                nativeID={nativeID}
                onLayout={onLayoutInternal}
            />
        );
        return (
            <Animated.View style={[chatFooterStyles, reportFooterStyles]}>
                {shouldShowEnableNotificationsBanner ? (
                    <>
                        <EnableNotificationsBanner />
                        <View style={[composerOverlapStyle, isComposerFullSize && styles.flex1]}>{composer}</View>
                    </>
                ) : (
                    composer
                )}
            </Animated.View>
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

    // Admins-only room — keep the banner visible; mount the composer above it while editing on narrow screens.
    if (isAdminsOnlyPostingRoom && !isUserPolicyAdmin) {
        const isEditingWithComposer = shouldShowComposerForActiveEditDraft;

        return (
            <View style={[styles.chatFooter, !isEditingWithComposer && styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                {isEditingWithComposer && (
                    <Animated.View style={[chatFooterStyles, reportFooterStyles]}>
                        <ReportActionCompose.EditOnly
                            reportID={reportIDFromRoute}
                            nativeID={nativeID}
                            onLayout={onLayoutInternal}
                        />
                    </Animated.View>
                )}
                <Banner
                    containerStyles={[styles.chatFooterBanner, isEditingWithComposer && styles.mt2]}
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

    // Permissions-based lockout: the report's permissions array is non-empty and excludes both
    // "write" and "auditor" (e.g. "read" only via Report::inviteToRoom, donor-matching shares,
    // anonymous access to public rooms). Render a neutral banner so the user isn't left with an
    // empty footer. Other reasons the composer is hidden (creation errorFields, money-request
    // pending deletion, mobile keyboard dismiss) fall through to null so their more specific
    // indicators keep priority.
    if (!canWriteInReport) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <Banner
                    containerStyles={[styles.chatFooterBanner]}
                    text={translate('readOnlyConversation')}
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
