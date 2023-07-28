import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import {parsePhoneNumber} from 'awesome-phonenumber';
import styles from '../styles/styles';
import Text from '../components/Text';
import ONYXKEYS from '../ONYXKEYS';
import Avatar from '../components/Avatar';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
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
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import * as UserUtils from '../libs/UserUtils';

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        /** login passed via route /details/:login */
        login: PropTypes.string,

        /** report ID passed */
        reportID: PropTypes.string,
    }),
});

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** Route params */
    route: matchType.isRequired,

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Date login was validated, used to show info indicator status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    // When opening someone else's profile (via deep link) before login, this is empty
    personalDetails: {},
    loginList: {},
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
    const parsedPhoneNumber = parsePhoneNumber(details.displayName);
    if (parsedPhoneNumber.possible) {
        return parsedPhoneNumber.number.e164;
    }

    // If the user has set a displayName, get the phone number from the SMS login
    return details.login ? Str.removeSMSDomain(details.login) : '';
};

function DetailsPage(props) {
    const login = lodashGet(props.route.params, 'login', '');
    let details = _.find(props.personalDetails, (detail) => detail.login === login.toLowerCase());

    if (!details) {
        // TODO: these personal details aren't in my local test account but are in
        // my staging account, i wonder why!
        if (login === CONST.EMAIL.CONCIERGE) {
            details = {
                accountID: CONST.ACCOUNT_ID.CONCIERGE,
                login,
                displayName: 'Concierge',
                avatar: UserUtils.getDefaultAvatar(CONST.ACCOUNT_ID.CONCIERGE),
            };
        } else {
            const optimisticAccountID = UserUtils.generateAccountID(login);
            details = {
                accountID: optimisticAccountID,
                login,
                displayName: login,
                avatar: UserUtils.getDefaultAvatar(optimisticAccountID),
            };
        }
    }

    const isSMSLogin = details.login ? Str.isSMSLogin(details.login) : false;

    const shouldShowLocalTime = !ReportUtils.hasAutomatedExpensifyAccountIDs([details.accountID]) && details.timezone;
    let pronouns = details.pronouns;

    if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
        const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
        pronouns = props.translate(`pronouns.${localeKey}`);
    }

    const phoneNumber = getPhoneNumber(details);
    const phoneOrEmail = isSMSLogin ? getPhoneNumber(details) : details.login;

    const isCurrentUser = _.keys(props.loginList).includes(details.login);

    return (
        <ScreenWrapper>
            <FullPageNotFoundView shouldShow={_.isEmpty(login)}>
                <HeaderWithBackButton
                    title={props.translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.HOME)}
                />
                <View
                    pointerEvents="box-none"
                    style={[styles.containerWithSpaceBetween]}
                >
                    {details ? (
                        <ScrollView>
                            <View style={styles.avatarSectionWrapper}>
                                <AttachmentModal
                                    headerTitle={details.displayName}
                                    source={UserUtils.getFullSizeAvatar(details.avatar, details.accountID)}
                                    isAuthTokenRequired
                                    originalFileName={details.originalFileName}
                                >
                                    {({show}) => (
                                        <PressableWithoutFocus
                                            style={[styles.noOutline]}
                                            onPress={show}
                                            accessibilityLabel={props.translate('common.details')}
                                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                        >
                                            <OfflineWithFeedback pendingAction={lodashGet(details, 'pendingFields.avatar', null)}>
                                                <Avatar
                                                    containerStyles={[styles.avatarLarge, styles.mb3]}
                                                    imageStyles={[styles.avatarLarge]}
                                                    source={UserUtils.getAvatar(details.avatar, details.accountID)}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                />
                                            </OfflineWithFeedback>
                                        </PressableWithoutFocus>
                                    )}
                                </AttachmentModal>
                                {Boolean(details.displayName) && (
                                    <Text
                                        style={[styles.textHeadline, styles.mb6, styles.pre]}
                                        numberOfLines={1}
                                    >
                                        {details.displayName}
                                    </Text>
                                )}
                                {details.login ? (
                                    <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.w100]}>
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mb1]}
                                            numberOfLines={1}
                                        >
                                            {props.translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                        </Text>
                                        <CommunicationsLink value={phoneOrEmail}>
                                            <UserDetailsTooltip accountID={details.accountID}>
                                                <Text numberOfLines={1}>{isSMSLogin ? props.formatPhoneNumber(phoneNumber) : details.login}</Text>
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
                                {shouldShowLocalTime && <AutoUpdateTime timezone={details.timezone} />}
                            </View>
                            {!isCurrentUser && (
                                <MenuItem
                                    title={`${props.translate('common.message')}${details.displayName}`}
                                    icon={Expensicons.ChatBubble}
                                    onPress={() => Report.navigateToAndOpenReport([login])}
                                    wrapperStyle={styles.breakAll}
                                    shouldShowRightIcon
                                />
                            )}
                        </ScrollView>
                    ) : null}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DetailsPage.propTypes = propTypes;
DetailsPage.defaultProps = defaultProps;
DetailsPage.displayName = 'DetailsPage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
)(DetailsPage);
