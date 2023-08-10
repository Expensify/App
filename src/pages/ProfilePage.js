import {View, ScrollView} from 'react-native';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import {parsePhoneNumber} from 'awesome-phonenumber';
import * as Session from '../libs/actions/Session';
import styles from '../styles/styles';
import Text from '../components/Text';
import ONYXKEYS from '../ONYXKEYS';
import Avatar from '../components/Avatar';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import CommunicationsLink from '../components/CommunicationsLink';
import UserDetailsTooltip from '../components/UserDetailsTooltip';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from '../components/Icon/Expensicons';
import MenuItem from '../components/MenuItem';
import AttachmentModal from '../components/AttachmentModal';
import PressableWithoutFocus from '../components/Pressable/PressableWithoutFocus';
import * as Report from '../libs/actions/Report';
import OfflineWithFeedback from '../components/OfflineWithFeedback';
import AutoUpdateTime from '../components/AutoUpdateTime';
import * as UserUtils from '../libs/UserUtils';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import BlockingView from '../components/BlockingViews/BlockingView';
import * as Illustrations from '../components/Icon/Illustrations';
import variables from '../styles/variables';
import ROUTES from '../ROUTES';
import * as ValidationUtils from '../libs/ValidationUtils';

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

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,
    }),

    /** Indicates whether the app is loading initial data */
    isLoadingReportData: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    // When opening someone else's profile (via deep link) before login, this is empty
    personalDetails: {},
    loginList: {},
    isLoadingReportData: true,
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
    const accountID = Number(lodashGet(props.route.params, 'accountID', 0));

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (ValidationUtils.isValidAccountRoute(accountID)) {
            PersonalDetails.openPublicProfilePage(accountID);
        }
    }, [accountID]);

    const details = lodashGet(props.personalDetails, accountID, ValidationUtils.isValidAccountRoute(accountID) ? {} : {isloading: false});

    const displayName = details.displayName ? details.displayName : props.translate('common.hidden');
    const avatar = lodashGet(details, 'avatar', UserUtils.getDefaultAvatar());
    const originalFileName = lodashGet(details, 'originalFileName', '');
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

    const isCurrentUser = _.keys(props.loginList).includes(login);
    const hasMinimumDetails = !_.isEmpty(details.avatar);
    const isLoading = lodashGet(details, 'isLoading', false) || _.isEmpty(details) || props.isLoadingReportData;

    // If the API returns an error for some reason there won't be any details and isLoading will get set to false, so we want to show a blocking screen
    const shouldShowBlockingView = !hasMinimumDetails && !isLoading;

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={props.translate('common.profile')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.HOME)}
            />
            <View
                pointerEvents="box-none"
                style={[styles.containerWithSpaceBetween]}
            >
                {hasMinimumDetails && (
                    <ScrollView>
                        <View style={styles.avatarSectionWrapper}>
                            <AttachmentModal
                                headerTitle={displayName}
                                source={UserUtils.getFullSizeAvatar(avatar, accountID)}
                                isAuthTokenRequired
                                originalFileName={originalFileName}
                            >
                                {({show}) => (
                                    <PressableWithoutFocus
                                        style={[styles.noOutline]}
                                        onPress={show}
                                        accessibilityLabel={props.translate('common.profile')}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                    >
                                        <OfflineWithFeedback pendingAction={lodashGet(details, 'pendingFields.avatar', null)}>
                                            <Avatar
                                                containerStyles={[styles.avatarLarge, styles.mb3]}
                                                imageStyles={[styles.avatarLarge]}
                                                source={UserUtils.getAvatar(avatar, accountID)}
                                                size={CONST.AVATAR_SIZE.LARGE}
                                            />
                                        </OfflineWithFeedback>
                                    </PressableWithoutFocus>
                                )}
                            </AttachmentModal>
                            {Boolean(displayName) && (
                                <Text
                                    style={[styles.textHeadline, styles.mb6, styles.pre]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
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
                    </ScrollView>
                )}
                {!hasMinimumDetails && isLoading && <FullScreenLoadingIndicator style={styles.flex1} />}
                {shouldShowBlockingView && (
                    <BlockingView
                        icon={Illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={props.translate('notFound.notHere')}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(ProfilePage);
