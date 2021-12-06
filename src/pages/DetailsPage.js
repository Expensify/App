import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import styles from '../styles/styles';
import ExpensifyText from '../components/ExpensifyText';
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
import * as ReportUtils from '../libs/reportUtils';

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
    personalDetails: personalDetailsPropType.isRequired,

    /** Route params */
    route: matchType.isRequired,

    ...withLocalizePropTypes,
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

const DetailsPage = (props) => {
    const details = props.personalDetails[props.route.params.login];
    const isSMSLogin = Str.isSMSLogin(details.login);

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowBackButton = Boolean(props.route.params.reportID);
    const timezone = moment().tz(details.timezone.selected);
    const GMTTime = `${timezone.toString().split(/[+-]/)[0].slice(-3)} ${timezone.zoneAbbr()}`;
    const currentTime = Number.isNaN(Number(timezone.zoneAbbr())) ? timezone.zoneAbbr() : GMTTime;
    const shouldShowLocalTime = !ReportUtils.hasExpensifyEmails([details.login]);

    let pronouns = details.pronouns;

    if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
        const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
        pronouns = props.translate(`pronouns.${localeKey}`);
    }

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('common.details')}
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
                            <Avatar
                                containerStyles={[styles.avatarLarge, styles.mb3]}
                                imageStyles={[styles.avatarLarge]}
                                source={details.avatar}
                            />
                            {details.displayName && (
                                <ExpensifyText style={[styles.displayName, styles.mb6]} numberOfLines={1}>
                                    {isSMSLogin ? props.toLocalPhone(details.displayName) : details.displayName}
                                </ExpensifyText>
                            )}
                            {details.login ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.w100]}>
                                    <ExpensifyText style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {props.translate(isSMSLogin
                                            ? 'common.phoneNumber'
                                            : 'common.email')}
                                    </ExpensifyText>
                                    <CommunicationsLink
                                        type={isSMSLogin ? CONST.LOGIN_TYPE.PHONE : CONST.LOGIN_TYPE.EMAIL}
                                        value={isSMSLogin ? getPhoneNumber(details) : details.login}
                                    >
                                        <Tooltip text={isSMSLogin ? getPhoneNumber(details) : details.login}>
                                            <ExpensifyText numberOfLines={1}>
                                                {isSMSLogin
                                                    ? props.toLocalPhone(getPhoneNumber(details))
                                                    : details.login}
                                            </ExpensifyText>
                                        </Tooltip>
                                    </CommunicationsLink>
                                </View>
                            ) : null}
                            {pronouns ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <ExpensifyText style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {props.translate('profilePage.preferredPronouns')}
                                    </ExpensifyText>
                                    <ExpensifyText numberOfLines={1}>
                                        {pronouns}
                                    </ExpensifyText>
                                </View>
                            ) : null}
                            {shouldShowLocalTime && details.timezone ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <ExpensifyText style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {props.translate('detailsPage.localTime')}
                                    </ExpensifyText>
                                    <ExpensifyText numberOfLines={1}>
                                        {timezone.format('LT')}
                                        {' '}
                                        {currentTime}
                                    </ExpensifyText>
                                </View>
                            ) : null}
                        </View>
                    </ScrollView>
                ) : null}
            </View>
        </ScreenWrapper>
    );
};

DetailsPage.propTypes = propTypes;
DetailsPage.displayName = 'DetailsPage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(DetailsPage);
