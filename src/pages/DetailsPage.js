import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
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
import CONST from '../CONST';

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

const DetailsPage = ({
    personalDetails, route, translate, toLocalPhone,
}) => {
    const details = personalDetails[route.params.login];
    const isSMSLogin = Str.isSMSLogin(details.login);

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowBackButton = Boolean(route.params.reportID);
    const timezone = moment().tz(details.timezone.selected);
    const GMTTime = `${timezone.toString().split(/[+-]/)[0].slice(-3)} ${timezone.zoneAbbr()}`;
    const currentTime = Number.isNaN(Number(timezone.zoneAbbr())) ? timezone.zoneAbbr() : GMTTime;

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('common.details')}
                shouldShowBackButton={shouldShowBackButton}
                onBackButtonPress={Navigation.goBack}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.containerWithSpaceBetween,
                ]}
            >
                {details ? (
                    <View>
                        <View style={styles.pageWrapper}>
                            <Avatar
                                containerStyles={[styles.avatarLarge, styles.mb3]}
                                imageStyles={[styles.avatarLarge]}
                                source={details.avatar}
                            />
                            <CommunicationsLink
                                style={[styles.mt1, styles.mb6]}
                                type={details.displayName && isSMSLogin ? CONST.LOGIN_TYPE.PHONE : undefined}
                                value={getPhoneNumber(details)}
                            >
                                <Text style={[styles.displayName]} numberOfLines={1}>
                                    {details.displayName && isSMSLogin
                                        ? toLocalPhone(details.displayName)
                                        : (details.displayName || null)}
                                </Text>
                            </CommunicationsLink>
                            {details.login ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {translate(isSMSLogin
                                            ? 'common.phoneNumber'
                                            : 'common.email')}
                                    </Text>
                                    <CommunicationsLink
                                        type={isSMSLogin ? CONST.LOGIN_TYPE.PHONE : CONST.LOGIN_TYPE.EMAIL}
                                        value={isSMSLogin ? getPhoneNumber(details) : details.login}
                                    >
                                        <Text numberOfLines={1}>
                                            {isSMSLogin
                                                ? toLocalPhone(getPhoneNumber(details))
                                                : details.login}
                                        </Text>
                                    </CommunicationsLink>
                                </View>
                            ) : null}
                            {details.pronouns ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {translate('profilePage.preferredPronouns')}
                                    </Text>
                                    <Text numberOfLines={1}>
                                        {details.pronouns}
                                    </Text>
                                </View>
                            ) : null}
                            {details.timezone ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {translate('detailsPage.localTime')}
                                    </Text>
                                    <Text numberOfLines={1}>
                                        {timezone.format('LT')}
                                        {' '}
                                        {currentTime}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
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
