import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import Text from '../components/Text';
import ONYXKEYS from '../ONYXKEYS';
import Avatar from '../components/Avatar';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import CommunicationsLink from '../components/CommunicationsLink';
import Tooltip from '../components/Tooltip';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from '../components/Icon/Expensicons';
import MenuItem from '../components/MenuItem';
import AttachmentModal from '../components/AttachmentModal';
import PressableWithoutFocus from '../components/PressableWithoutFocus';
import * as Report from '../libs/actions/Report';
import OfflineWithFeedback from '../components/OfflineWithFeedback';
import AutoUpdateTime from '../components/AutoUpdateTime';

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    // When opening someone else's profile (via deep link) before login, this is empty
    personalDetails: {},
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
    if (Str.isValidPhone(details.displayName)) {
        return details.displayName;
    }

    // If the user has set a displayName, get the phone number from the SMS login
    return Str.removeSMSDomain(details.login);
};

class DetailsPage extends React.PureComponent {
    componentDidMount() {
        if (lodashGet(this.props.route.params, 'login')) {
            return;
        }

        // Leave the page when the login information is not available
        Navigation.dismissModal();
    }

    render() {
        let details = lodashGet(this.props.personalDetails, lodashGet(this.props.route.params, 'login'));
        const login = lodashGet(this.props.route.params, 'login');
        const avatar = ReportUtils.getCorrectAvatar(lodashGet(details, 'avatar', ''), login);

        if (!details) {
            details = {
                login,
                displayName: ReportUtils.getDisplayNameForParticipant(login),
                avatar,
            };
        }

        const isSMSLogin = Str.isSMSLogin(details.login);

        // If we have a reportID param this means that we
        // arrived here via the ParticipantsPage and should be allowed to navigate back to it
        const shouldShowBackButton = Boolean(this.props.route.params.reportID);
        const shouldShowLocalTime = !ReportUtils.hasExpensifyEmails([details.login]) && details.timezone;
        let pronouns = details.pronouns;

        if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
            const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
            pronouns = this.props.translate(`pronouns.${localeKey}`);
        }

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.details')}
                    shouldShowBackButton={shouldShowBackButton}
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View
                    pointerEvents="box-none"
                    style={[
                        styles.containerWithSpaceBetween,
                    ]}
                >
                    {details ? (
                        <ScrollView>
                            <View style={styles.pageWrapper}>
                                <AttachmentModal
                                    headerTitle={isSMSLogin ? this.props.toLocalPhone(details.displayName) : details.displayName}
                                    source={ReportUtils.getCorrectAvatar(details.avatar, details.login)}
                                    isAuthTokenRequired
                                >
                                    {({show}) => (
                                        <PressableWithoutFocus
                                            style={styles.noOutline}
                                            onPress={show}
                                        >
                                            <OfflineWithFeedback
                                                pendingAction={lodashGet(details, 'pendingFields.avatar', null)}
                                            >
                                                <Avatar
                                                    containerStyles={[styles.avatarLarge, styles.mb3]}
                                                    imageStyles={[styles.avatarLarge]}
                                                    source={ReportUtils.getCorrectAvatar(details.avatar, details.login)}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                />
                                            </OfflineWithFeedback>
                                        </PressableWithoutFocus>
                                    )}
                                </AttachmentModal>
                                {details.displayName && (
                                    <Text style={[styles.textHeadline, styles.mb6]} numberOfLines={1}>
                                        {isSMSLogin ? this.props.toLocalPhone(details.displayName) : details.displayName}
                                    </Text>
                                )}
                                {details.login ? (
                                    <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.w100]}>
                                        <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                            {this.props.translate(isSMSLogin
                                                ? 'common.phoneNumber'
                                                : 'common.email')}
                                        </Text>
                                        <CommunicationsLink value={isSMSLogin ? getPhoneNumber(details) : details.login}>
                                            <Tooltip text={isSMSLogin ? getPhoneNumber(details) : details.login}>
                                                <Text numberOfLines={1}>
                                                    {isSMSLogin
                                                        ? this.props.toLocalPhone(getPhoneNumber(details))
                                                        : details.login}
                                                </Text>
                                            </Tooltip>
                                        </CommunicationsLink>
                                    </View>
                                ) : null}
                                {pronouns ? (
                                    <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                        <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                            {this.props.translate('profilePage.preferredPronouns')}
                                        </Text>
                                        <Text numberOfLines={1}>
                                            {pronouns}
                                        </Text>
                                    </View>
                                ) : null}
                                {shouldShowLocalTime && <AutoUpdateTime timezone={details.timezone} />}
                            </View>
                            {details.login !== this.props.session.email && (
                                <MenuItem
                                    title={`${this.props.translate('common.message')}${details.displayName}`}
                                    icon={Expensicons.ChatBubble}
                                    onPress={() => Report.navigateToAndOpenReport([details.login])}
                                    wrapperStyle={styles.breakAll}
                                    shouldShowRightIcon
                                />
                            )}
                        </ScrollView>
                    ) : null}
                </View>
            </ScreenWrapper>
        );
    }
}

DetailsPage.propTypes = propTypes;
DetailsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(DetailsPage);
