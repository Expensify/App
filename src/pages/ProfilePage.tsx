import type {StackScreenProps} from '@react-navigation/stack';
import Str from 'expensify-common/lib/str';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import AutoUpdateTime from '@components/AutoUpdateTime';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CommunicationsLink from '@components/CommunicationsLink';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {ProfileNavigatorParamList} from '@navigation/types';
import * as PersonalDetailsActions from '@userActions/PersonalDetails';
import * as ReportActions from '@userActions/Report';
import * as SessionActions from '@userActions/Session';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ProfilePageProps = StackScreenProps<ProfileNavigatorParamList, typeof SCREENS.PROFILE_ROOT>;

/**
 * Gets the phone number to display for SMS logins
 */
const getPhoneNumber = ({login = '', displayName = ''}: PersonalDetails | EmptyObject): string | undefined => {
    // If the user hasn't set a displayName, it is set to their phone number
    const parsedPhoneNumber = parsePhoneNumber(displayName);

    if (parsedPhoneNumber.possible) {
        return parsedPhoneNumber?.number?.e164;
    }

    // If the user has set a displayName, get the phone number from the SMS login
    return login ? Str.removeSMSDomain(login) : '';
};

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
        isPolicyExpenseChat: report.isPolicyExpenseChat,
    };

function ProfilePage({route}: ProfilePageProps) {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: chatReportSelector});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const reportKey = useMemo(() => {
        const accountID = Number(route.params?.accountID ?? 0);
        const reportID = ReportUtils.getChatByParticipants(session?.accountID ? [accountID, session.accountID] : [], reports)?.reportID ?? '';

        if ((Boolean(session) && Number(session?.accountID) === accountID) || SessionActions.isAnonymousUser() || !reportID) {
            return `${ONYXKEYS.COLLECTION.REPORT}0` as const;
        }
        return `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    }, [reports, route.params?.accountID, session]);
    const [report] = useOnyx(reportKey);

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const accountID = Number(route.params?.accountID ?? 0);
    const isCurrentUser = session?.accountID === accountID;
    const details: PersonalDetails | EmptyObject = personalDetails?.[accountID] ?? (ValidationUtils.isValidAccountRoute(accountID) ? {} : {accountID: 0});

    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(details, undefined, undefined, isCurrentUser);
    const fallbackIcon = details?.fallbackIcon ?? '';
    const login = details?.login ?? '';
    const timezone = details?.timezone;
    const reportRecipient = personalDetails?.[accountID];
    const isParticipantValidated = reportRecipient?.validated ?? false;

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowLocalTime = !ReportUtils.hasAutomatedExpensifyAccountIDs([accountID]) && !isEmptyObject(timezone) && isParticipantValidated;
    let pronouns = details?.pronouns ?? '';
    if (pronouns?.startsWith(CONST.PRONOUNS.PREFIX)) {
        const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
        pronouns = translate(`pronouns.${localeKey}` as TranslationPaths);
    }

    const isSMSLogin = Str.isSMSLogin(login);
    const phoneNumber = getPhoneNumber(details);
    const phoneOrEmail = isSMSLogin ? getPhoneNumber(details) : login;

    const hasAvatar = Boolean(details.avatar);
    const isLoading = Boolean(personalDetailsMetadata?.[accountID]?.isLoading) || isEmptyObject(details);

    const statusEmojiCode = details?.status?.emojiCode ?? '';
    const statusText = details?.status?.text ?? '';
    const hasStatus = !!statusEmojiCode;
    const statusContent = `${statusEmojiCode}  ${statusText}`;

    const navigateBackTo = route?.params?.backTo;

    const shouldShowNotificationPreference =
        !isEmptyObject(report) && !isCurrentUser && !!report.notificationPreference && report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const notificationPreference = shouldShowNotificationPreference
        ? translate(`notificationPreferencesPage.notificationPreferences.${report.notificationPreference}` as TranslationPaths)
        : '';

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (ValidationUtils.isValidAccountRoute(accountID)) {
            PersonalDetailsActions.openPublicProfilePage(accountID);
        }
    }, [accountID]);

    return (
        <ScreenWrapper testID={ProfilePage.displayName}>
            <FullPageNotFoundView shouldShow={CONST.RESTRICTED_ACCOUNT_IDS.includes(accountID)}>
                <HeaderWithBackButton
                    title={translate('common.profile')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <ScrollView>
                        <View style={styles.avatarSectionWrapper}>
                            <PressableWithoutFocus
                                style={[styles.noOutline]}
                                onPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(String(accountID)))}
                                accessibilityLabel={translate('common.profile')}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                disabled={!hasAvatar}
                            >
                                <OfflineWithFeedback pendingAction={details?.pendingFields?.avatar}>
                                    <Avatar
                                        containerStyles={[styles.avatarXLarge, styles.mb3]}
                                        imageStyles={[styles.avatarXLarge]}
                                        source={details.avatar}
                                        avatarID={accountID}
                                        size={CONST.AVATAR_SIZE.XLARGE}
                                        fallbackIcon={fallbackIcon}
                                    />
                                </OfflineWithFeedback>
                            </PressableWithoutFocus>
                            {Boolean(displayName) && (
                                <Text
                                    style={[styles.textHeadline, styles.pre, styles.mb6, styles.w100, styles.textAlignCenter]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
                            )}
                            {hasStatus && (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.mw100]}>
                                    <Text
                                        style={[styles.textLabelSupporting, styles.mb1]}
                                        numberOfLines={1}
                                    >
                                        {translate('statusPage.status')}
                                    </Text>
                                    <Text>{statusContent}</Text>
                                </View>
                            )}

                            {/* Don't display email if current user is anonymous */}
                            {!(isCurrentUser && SessionActions.isAnonymousUser()) && login ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.w100]}>
                                    <Text
                                        style={[styles.textLabelSupporting, styles.mb1]}
                                        numberOfLines={1}
                                    >
                                        {translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                    </Text>
                                    <CommunicationsLink value={phoneOrEmail ?? ''}>
                                        <UserDetailsTooltip accountID={details.accountID}>
                                            <Text numberOfLines={1}>{isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : login}</Text>
                                        </UserDetailsTooltip>
                                    </CommunicationsLink>
                                </View>
                            ) : null}
                            {pronouns ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text
                                        style={[styles.textLabelSupporting, styles.mb1]}
                                        numberOfLines={1}
                                    >
                                        {translate('profilePage.preferredPronouns')}
                                    </Text>
                                    <Text numberOfLines={1}>{pronouns}</Text>
                                </View>
                            ) : null}
                            {shouldShowLocalTime && <AutoUpdateTime timezone={timezone} />}
                        </View>
                        {shouldShowNotificationPreference && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={notificationPreference}
                                description={translate('notificationPreferencesPage.label')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(report.reportID))}
                                wrapperStyle={[styles.mtn6, styles.mb5]}
                            />
                        )}
                        {!isCurrentUser && !SessionActions.isAnonymousUser() && (
                            <MenuItem
                                title={`${translate('common.message')}${displayName}`}
                                titleStyle={styles.flex1}
                                icon={Expensicons.ChatBubble}
                                onPress={() => ReportActions.navigateToAndOpenReportWithAccountIDs([accountID])}
                                wrapperStyle={styles.breakAll}
                                shouldShowRightIcon
                            />
                        )}
                        {!isEmptyObject(report) && report.reportID && !isCurrentUser && (
                            <MenuItem
                                title={`${translate('privateNotes.title')}`}
                                titleStyle={styles.flex1}
                                icon={Expensicons.Pencil}
                                onPress={() => ReportUtils.navigateToPrivateNotes(report, session)}
                                wrapperStyle={styles.breakAll}
                                shouldShowRightIcon
                                brickRoadIndicator={ReportActions.hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        )}
                    </ScrollView>
                    {!hasAvatar && isLoading && <FullScreenLoadingIndicator style={styles.flex1} />}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
