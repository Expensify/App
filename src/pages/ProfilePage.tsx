import {hasSeenTourSelector} from '@selectors/Onboarding';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import AutoUpdateTime from '@components/AutoUpdateTime';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Permissions from '@libs/Permissions';
import {getDisplayNameOrDefault, getPhoneNumber} from '@libs/PersonalDetailsUtils';
import {
    findSelfDMReportID,
    getChatByParticipants,
    getReportNotificationPreference,
    hasAutomatedExpensifyAccountIDs,
    isConciergeChatReport,
    isHiddenForCurrentUser as isReportHiddenForCurrentUser,
    navigateToPrivateNotes,
} from '@libs/ReportUtils';
import {isAgentEmail} from '@libs/SessionUtils';
import {generateAccountID} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import type {ProfileNavigatorParamList} from '@navigation/types';
import {openAgentsPage} from '@userActions/Agent';
import {connect} from '@userActions/Delegate';
import {openExternalLink} from '@userActions/Link';
import {openPublicProfilePage} from '@userActions/PersonalDetails';
import {hasErrorInPrivateNotes} from '@userActions/Report';
import {callFunctionIfActionIsAllowed, isAnonymousUser as isAnonymousUserSession} from '@userActions/Session';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {PersonalDetails, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type ProfilePageProps = PlatformStackScreenProps<ProfileNavigatorParamList, typeof SCREENS.PROFILE_ROOT>;

/**
 * This function narrows down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 */
const chatReportSelector = (report: OnyxEntry<Report>): OnyxEntry<Report> =>
    report && {
        reportID: report.reportID,
        participants: report.participants,
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
        type: report.type,
        chatType: report.chatType,
    };

const reportsSelector = (reports: OnyxCollection<Report>) => mapOnyxCollectionItems(reports, chatReportSelector);

function ProfilePage({route}: ProfilePageProps) {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelector});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {isOffline} = useNetwork();
    const guideCalendarLink = account?.guideDetails?.calendarLink ?? '';
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bug', 'Pencil', 'Phone', 'UserPlus']);
    const accountID = Number(route.params?.accountID ?? CONST.DEFAULT_NUMBER_ID);
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const isCurrentUser = currentUserAccountID === accountID;
    const reportID = isCurrentUser ? findSelfDMReportID() : getChatByParticipants(currentUserAccountID ? [accountID, currentUserAccountID] : [], reports)?.reportID;
    const reportKey = isAnonymousUserSession() || !reportID ? (`${ONYXKEYS.COLLECTION.REPORT}0` as const) : (`${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const);

    const [report] = useOnyx(reportKey);

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const showGpsInProgressModal = useCallback(
        async (switchAccount: () => ReturnType<typeof connect>) => {
            const result = await showConfirmModal({
                title: translate('gps.switchAccountWarningTripInProgress.title'),
                prompt: translate('gps.switchAccountWarningTripInProgress.prompt'),
                confirmText: translate('gps.switchAccountWarningTripInProgress.confirm'),
                cancelText: translate('common.cancel'),
            });

            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            await stopGpsTrip(false, getGpsPoints(gpsDraftDetails), true);
            switchAccount();
        },
        [gpsDraftDetails, showConfirmModal, translate],
    );

    const isValidAccountID = isValidAccountRoute(accountID);
    const loginParams = route.params?.login;

    let details: OnyxEntry<PersonalDetails>;
    // Check if we have the personal details already in Onyx
    if (personalDetails?.[accountID]) {
        details = personalDetails?.[accountID] ?? undefined;
    } else if (!loginParams) {
        // Check if we have the login param
        details = isValidAccountID ? undefined : {accountID: 0};
    } else {
        // Look up the personal details by login
        const foundDetails = Object.values(personalDetails ?? {}).find((personalDetail) => personalDetail?.login === loginParams?.toLowerCase());
        if (foundDetails) {
            details = foundDetails;
        } else {
            // If we don't have the personal details in Onyx, we can create an optimistic account
            const optimisticAccountID = generateAccountID(loginParams);
            details = {accountID: optimisticAccountID, login: loginParams, displayName: loginParams};
        }
    }

    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details, undefined, undefined, isCurrentUser, translate('common.you').toLowerCase()));

    const fallbackIcon = details?.fallbackIcon ?? '';
    const login = details?.login ?? '';
    const timezone = details?.timezone;
    const reportRecipient = personalDetails?.[accountID];
    const isParticipantValidated = reportRecipient?.validated ?? false;

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowLocalTime = !hasAutomatedExpensifyAccountIDs([accountID]) && !isAgentEmail(login) && !isEmptyObject(timezone) && isParticipantValidated;
    let pronouns = details?.pronouns ?? '';
    if (pronouns?.startsWith(CONST.PRONOUNS.PREFIX)) {
        const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
        pronouns = translate(`pronouns.${localeKey}` as TranslationPaths);
    }

    const isSMSLogin = Str.isSMSLogin(login);
    const phoneNumber = getPhoneNumber(details);

    const hasAvatar = !!details?.avatar;
    const isLoading = !!personalDetailsMetadata?.[accountID]?.isLoading || isEmptyObject(details);
    const shouldShowBlockingView = (!isValidAccountID && !isLoading) || CONST.RESTRICTED_ACCOUNT_IDS.includes(accountID);

    const statusEmojiCode = details?.status?.emojiCode ?? '';
    const statusText = details?.status?.text ?? '';
    const hasStatus = !!statusEmojiCode;
    const statusContent = `${statusEmojiCode}  ${statusText}`;

    const isOwnedAgent = !isCurrentUser && isAgentEmail(login) && !!agentPrompt;
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;

    const navigateBackTo = route?.params?.backTo;

    const notificationPreferenceValue = getReportNotificationPreference(report);

    const shouldShowNotificationPreference = !isEmptyObject(report) && !isCurrentUser && !isReportHiddenForCurrentUser(notificationPreferenceValue);
    const notificationPreference = shouldShowNotificationPreference
        ? translate(`notificationPreferencesPage.notificationPreferences.${notificationPreferenceValue}` as TranslationPaths)
        : '';
    const isConcierge = isConciergeChatReport(report);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // Concierge's profile page information is already available in CONST.ts
        if (isValidAccountRoute(accountID) && !loginParams && !isConcierge) {
            openPublicProfilePage(accountID);
        }
    }, [accountID, loginParams, isConcierge]);

    useEffect(() => {
        if (isCurrentUser || !isAgentEmail(login)) {
            return;
        }
        openAgentsPage();
    }, [isCurrentUser, login]);

    const promotedActions: PromotedAction[] = [];
    if (report) {
        promotedActions.push(PromotedActions.pin(report));
    }

    // If it's a self DM, we only want to show the Message button if the self DM report exists because we don't want to optimistically create a report for self DM
    if ((!isCurrentUser || report) && !isAnonymousUserSession()) {
        promotedActions.push(
            PromotedActions.message({reportID: report?.reportID, personalDetails, accountID, login: loginParams, currentUserAccountID, introSelected, isSelfTourViewed, betas}),
        );
    }

    return (
        <ScreenWrapper testID="ProfilePage">
            <FullPageNotFoundView shouldShow={shouldShowBlockingView}>
                <HeaderWithBackButton
                    title={translate('common.profile')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <ScrollView>
                        <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <PressableWithoutFocus
                                style={[styles.noOutline, styles.mb4]}
                                onPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(accountID, Navigation.getActiveRoute()))}
                                accessibilityLabel={translate('common.profile')}
                                accessibilityRole={CONST.ROLE.BUTTON}
                                disabled={!hasAvatar}
                                sentryLabel={CONST.SENTRY_LABEL.PROFILE_PAGE.AVATAR}
                            >
                                <OfflineWithFeedback pendingAction={details?.pendingFields?.avatar}>
                                    <Avatar
                                        containerStyles={[styles.avatarXLarge]}
                                        imageStyles={[styles.avatarXLarge]}
                                        source={details?.avatar}
                                        avatarID={accountID}
                                        type={CONST.ICON_TYPE_AVATAR}
                                        size={CONST.AVATAR_SIZE.X_LARGE}
                                        fallbackIcon={fallbackIcon}
                                    />
                                </OfflineWithFeedback>
                            </PressableWithoutFocus>
                            {!!displayName && (
                                <Text
                                    style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
                            )}
                            <PromotedActionsBar
                                promotedActions={promotedActions}
                                containerStyle={[styles.ph0, styles.mb8]}
                            />
                            {hasStatus && (
                                <View style={[styles.detailsPageSectionContainer, styles.w100]}>
                                    <MenuItemWithTopDescription
                                        style={[styles.ph0]}
                                        title={statusContent}
                                        description={translate('statusPage.status')}
                                        interactive={false}
                                    />
                                </View>
                            )}

                            {/* Don't display email if current user is anonymous */}
                            {!(isCurrentUser && isAnonymousUserSession()) && login ? (
                                <View style={[styles.w100, styles.detailsPageSectionContainer]}>
                                    <MenuItemWithTopDescription
                                        style={[styles.ph0]}
                                        title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : login}
                                        copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : login}
                                        description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                        interactive={false}
                                        copyable
                                    />
                                </View>
                            ) : null}
                            {pronouns ? (
                                <View style={[styles.w100, styles.detailsPageSectionContainer]}>
                                    <MenuItemWithTopDescription
                                        style={[styles.ph0]}
                                        title={pronouns}
                                        description={translate('profilePage.preferredPronouns')}
                                        interactive={false}
                                    />
                                </View>
                            ) : null}
                            {shouldShowLocalTime && <AutoUpdateTime timezone={timezone} />}
                        </View>
                        {isCurrentUser && (
                            <MenuItem
                                shouldShowRightIcon
                                title={translate('common.editYourProfile')}
                                icon={expensifyIcons.Pencil}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute(Navigation.getActiveRoute()))}
                            />
                        )}
                        {isOwnedAgent && (
                            <OfflineWithFeedback
                                errors={agentPrompt?.promptErrors}
                                errorRowStyles={[styles.mh5, styles.mb2]}
                            >
                                <MenuItemWithTopDescription
                                    description={translate('profilePage.customInstructions')}
                                    title={agentPrompt?.prompt?.trim() ?? ''}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT_PROMPT.getRoute(accountID))}
                                    numberOfLinesTitle={2}
                                />
                            </OfflineWithFeedback>
                        )}
                        {isOwnedAgent && (
                            <MenuItem
                                title={translate('profilePage.copilotIntoAccount')}
                                icon={expensifyIcons.UserPlus}
                                onPress={callFunctionIfActionIsAllowed(() => {
                                    if (isOffline || isActingAsDelegate) {
                                        return;
                                    }
                                    const switchAction = () => connect({email: login, delegatedAccess: account?.delegatedAccess, credentials, session, activePolicyID});
                                    if (isTrackingGPS) {
                                        showGpsInProgressModal(switchAction);
                                        return;
                                    }
                                    switchAction();
                                })}
                            />
                        )}
                        {shouldShowNotificationPreference && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={notificationPreference}
                                description={translate('notificationPreferencesPage.label')}
                                onPress={() => {
                                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NOTIFICATION_PREFERENCES.getRoute(report.reportID)));
                                }}
                            />
                        )}
                        {Permissions.canUsePrivateNotes() && !isEmptyObject(report) && !!report.reportID && !isCurrentUser && (
                            <MenuItem
                                title={`${translate('privateNotes.title')}`}
                                titleStyle={styles.flex1}
                                icon={expensifyIcons.Pencil}
                                onPress={() => navigateToPrivateNotes(report, currentUserAccountID, true)}
                                wrapperStyle={styles.breakAll}
                                shouldShowRightIcon
                                brickRoadIndicator={hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        )}
                        {isConcierge && !!guideCalendarLink && (
                            <MenuItem
                                title={translate('videoChatButtonAndMenu.tooltip')}
                                icon={expensifyIcons.Phone}
                                isAnonymousAction={false}
                                onPress={callFunctionIfActionIsAllowed(() => {
                                    openExternalLink(guideCalendarLink);
                                })}
                            />
                        )}
                        {!!report?.reportID && !!isDebugModeEnabled && (
                            <MenuItem
                                title={translate('debug.debug')}
                                icon={expensifyIcons.Bug}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(report.reportID))}
                            />
                        )}
                    </ScrollView>
                    {!hasAvatar && isLoading && (
                        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                reasonAttributes={{context: 'ProfilePage', isLoading}}
                            />
                        </View>
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default ProfilePage;
