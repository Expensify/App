import {Str} from 'expensify-common';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import AutoUpdateTime from '@components/AutoUpdateTime';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
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
import {generateAccountID} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import type {ProfileNavigatorParamList} from '@navigation/types';
import {openExternalLink} from '@userActions/Link';
import {openPublicProfilePage} from '@userActions/PersonalDetails';
import {hasErrorInPrivateNotes} from '@userActions/Report';
import {callFunctionIfActionIsAllowed, isAnonymousUser as isAnonymousUserSession} from '@userActions/Session';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelector, canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA, {canBeMissing: true});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const guideCalendarLink = account?.guideDetails?.calendarLink ?? '';
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bug', 'Pencil', 'Phone']);
    const accountID = Number(route.params?.accountID ?? CONST.DEFAULT_NUMBER_ID);
    const isCurrentUser = currentUserAccountID === accountID;
    const reportKey = useMemo(() => {
        const reportID = isCurrentUser ? findSelfDMReportID() : getChatByParticipants(currentUserAccountID ? [accountID, currentUserAccountID] : [], reports)?.reportID;

        if (isAnonymousUserSession() || !reportID) {
            return `${ONYXKEYS.COLLECTION.REPORT}0` as const;
        }
        return `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    }, [accountID, isCurrentUser, reports, currentUserAccountID]);
    const [report] = useOnyx(reportKey, {canBeMissing: true});

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const isValidAccountID = isValidAccountRoute(accountID);
    const loginParams = route.params?.login;

    const details = useMemo((): OnyxEntry<PersonalDetails> => {
        // Check if we have the personal details already in Onyx
        if (personalDetails?.[accountID]) {
            return personalDetails?.[accountID] ?? undefined;
        }
        // Check if we have the login param
        if (!loginParams) {
            return isValidAccountID ? undefined : {accountID: 0};
        }
        // Look up the personal details by login
        const foundDetails = Object.values(personalDetails ?? {}).find((personalDetail) => personalDetail?.login === loginParams?.toLowerCase());
        if (foundDetails) {
            return foundDetails;
        }
        // If we don't have the personal details in Onyx, we can create an optimistic account
        const optimisticAccountID = generateAccountID(loginParams);
        return {accountID: optimisticAccountID, login: loginParams, displayName: loginParams};
    }, [personalDetails, accountID, loginParams, isValidAccountID]);

    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details, undefined, undefined, isCurrentUser, translate('common.you').toLowerCase()));
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const fallbackIcon = details?.fallbackIcon ?? '';
    const login = details?.login ?? '';
    const timezone = details?.timezone;
    const reportRecipient = personalDetails?.[accountID];
    const isParticipantValidated = reportRecipient?.validated ?? false;

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowLocalTime = !hasAutomatedExpensifyAccountIDs([accountID]) && !isEmptyObject(timezone) && isParticipantValidated;
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

    const promotedActions = useMemo(() => {
        const result: PromotedAction[] = [];
        if (report) {
            result.push(PromotedActions.pin(report));
        }

        // If it's a self DM, we only want to show the Message button if the self DM report exists because we don't want to optimistically create a report for self DM
        if ((!isCurrentUser || report) && !isAnonymousUserSession()) {
            result.push(PromotedActions.message({reportID: report?.reportID, accountID, login: loginParams, currentUserAccountID}));
        }
        return result;
    }, [accountID, isCurrentUser, loginParams, report, currentUserAccountID]);

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
                        {shouldShowNotificationPreference && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={notificationPreference}
                                description={translate('notificationPreferencesPage.label')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(report.reportID, navigateBackTo))}
                            />
                        )}
                        {!isEmptyObject(report) && !!report.reportID && !isCurrentUser && (
                            <MenuItem
                                title={`${translate('privateNotes.title')}`}
                                titleStyle={styles.flex1}
                                icon={expensifyIcons.Pencil}
                                onPress={() => navigateToPrivateNotes(report, currentUserAccountID, navigateBackTo)}
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
                    {!hasAvatar && isLoading && <FullScreenLoadingIndicator style={styles.flex1} />}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default ProfilePage;
