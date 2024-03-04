import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
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
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import personalDetailsPropType from './personalDetailsPropType';

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        /** accountID passed via route /a/:accountID */
        accountID: PropTypes.string,

        /** report ID passed */
        reportID: PropTypes.string,
    }),
});

const propTypes = {
    /* Onyx Props */

    /** The personal details of all users */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Route params */
    route: matchType.isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    // When opening someone else's profile (via deep link) before login, this is empty
    personalDetails: {},
    session: {
        accountID: 0,
    },
};

/**
 * Gets the phone number to display for SMS logins
 *
 * @param {Object} details
 * @param {String} details.login
 * @param {String} details.displayName
 * @returns {String}
 */
const getPhoneNumber = (details) => {
    // If the user hasn't set a displayName, it is set to their phone number, so use that
    const displayName = lodashGet(details, 'displayName', '');
    const parsedPhoneNumber = parsePhoneNumber(displayName);
    if (parsedPhoneNumber.possible) {
        return parsedPhoneNumber.number.e164;
    }

    // If the user has set a displayName, get the phone number from the SMS login
    return details.login ? Str.removeSMSDomain(details.login) : '';
};

function ProfilePage(props) {
    const styles = useThemeStyles();
    const accountID = Number(lodashGet(props.route.params, 'accountID', 0));
    const isCurrentUser = props.session.accountID === accountID;

    const details = lodashGet(props.personalDetails, accountID, ValidationUtils.isValidAccountRoute(accountID) ? {} : {isloading: false});
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(details, undefined, undefined, isCurrentUser);
    const avatar = lodashGet(details, 'avatar', UserUtils.getDefaultAvatar());
    const fallbackIcon = lodashGet(details, 'fallbackIcon', '');
    const login = lodashGet(details, 'login', '');
    const timezone = lodashGet(details, 'timezone', {});

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowLocalTime = !ReportUtils.hasAutomatedExpensifyAccountIDs([accountID]) && !_.isEmpty(timezone);
    let pronouns = lodashGet(details, 'pronouns', '');
    if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
        const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
        pronouns = props.translate(`pronouns.${localeKey}`);
    }

    const isSMSLogin = Str.isSMSLogin(login);
    const phoneNumber = getPhoneNumber(details);
    const phoneOrEmail = isSMSLogin ? getPhoneNumber(details) : login;

    const hasMinimumDetails = !_.isEmpty(details.avatar);
    const isLoading = lodashGet(details, 'isLoading', false) || _.isEmpty(details);

    // If the API returns an error for some reason there won't be any details and isLoading will get set to false, so we want to show a blocking screen
    const shouldShowBlockingView = !hasMinimumDetails && !isLoading;

    const statusEmojiCode = lodashGet(details, 'status.emojiCode', '');
    const statusText = lodashGet(details, 'status.text', '');
    const hasStatus = !!statusEmojiCode;
    const statusContent = `${statusEmojiCode}  ${statusText}`;

    const navigateBackTo = lodashGet(props.route, 'params.backTo');

    const shouldShowNotificationPreference = !_.isEmpty(props.report) && !isCurrentUser && props.report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const notificationPreference = shouldShowNotificationPreference ? props.translate(`notificationPreferencesPage.notificationPreferences.${props.report.notificationPreference}`) : '';

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (ValidationUtils.isValidAccountRoute(accountID) && !hasMinimumDetails) {
            PersonalDetails.openPublicProfilePage(accountID);
        }
    }, [accountID, hasMinimumDetails]);

    return (
        <ScreenWrapper testID={ProfilePage.displayName}>
            <FullPageNotFoundView shouldShow={shouldShowBlockingView || CONST.RESTRICTED_ACCOUNT_IDS.includes(accountID)}>
                <HeaderWithBackButton
                    title={props.translate('common.profile')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {hasMinimumDetails && (
                        <ScrollView>
                            <View style={styles.avatarSectionWrapper}>
                                <PressableWithoutFocus
                                    style={[styles.noOutline]}
                                    onPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(String(accountID)))}
                                    accessibilityLabel={props.translate('common.profile')}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                >
                                    <OfflineWithFeedback pendingAction={lodashGet(details, 'pendingFields.avatar', null)}>
                                        <Avatar
                                            containerStyles={[styles.avatarXLarge, styles.mb3]}
                                            imageStyles={[styles.avatarXLarge]}
                                            source={UserUtils.getAvatar(avatar, accountID)}
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
                                            {props.translate('statusPage.status')}
                                        </Text>
                                        <Text>{statusContent}</Text>
                                    </View>
                                )}

                                {login ? (
                                    <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.w100]}>
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mb1]}
                                            numberOfLines={1}
                                        >
                                            {props.translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                        </Text>
                                        <CommunicationsLink value={phoneOrEmail}>
                                            <UserDetailsTooltip accountID={details.accountID}>
                                                <Text numberOfLines={1}>{isSMSLogin ? props.formatPhoneNumber(phoneNumber) : login}</Text>
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
                                            {props.translate('profilePage.preferredPronouns')}
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
                                    description={props.translate('notificationPreferencesPage.label')}
                                    onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(props.report.reportID))}
                                    wrapperStyle={[styles.mtn6, styles.mb5]}
                                />
                            )}
                            {!isCurrentUser && !Session.isAnonymousUser() && (
                                <MenuItem
                                    title={`${props.translate('common.message')}${displayName}`}
                                    titleStyle={styles.flex1}
                                    icon={Expensicons.ChatBubble}
                                    onPress={() => Report.navigateToAndOpenReportWithAccountIDs([accountID])}
                                    wrapperStyle={styles.breakAll}
                                    shouldShowRightIcon
                                />
                            )}
                            {!_.isEmpty(props.report) && !isCurrentUser && (
                                <MenuItem
                                    title={`${props.translate('privateNotes.title')}`}
                                    titleStyle={styles.flex1}
                                    icon={Expensicons.Pencil}
                                    onPress={() => ReportUtils.navigateToPrivateNotes(props.report, props.session)}
                                    wrapperStyle={styles.breakAll}
                                    shouldShowRightIcon
                                    brickRoadIndicator={Report.hasErrorInPrivateNotes(props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                                />
                            )}
                        </ScrollView>
                    )}
                    {!hasMinimumDetails && isLoading && <FullScreenLoadingIndicator style={styles.flex1} />}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

/**
 * This function narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 * @param {Object} [report]
 * @returns {Object|undefined}
 */
const chatReportSelector = (report) =>
    report && {
        reportID: report.reportID,
        participantAccountIDs: report.participantAccountIDs,
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
        type: report.type,
        chatType: report.chatType,
        isPolicyExpenseChat: report.isPolicyExpenseChat,
    };

export default compose(
    withLocalize,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        report: {
            key: ({route, session, reports}) => {
                const accountID = Number(lodashGet(route.params, 'accountID', 0));
                const reportID = lodashGet(ReportUtils.getChatByParticipants([accountID], reports), 'reportID', '');
                if ((session && Number(session.accountID) === accountID) || Session.isAnonymousUser() || !reportID) {
                    return null;
                }
                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
    }),
)(ProfilePage);
