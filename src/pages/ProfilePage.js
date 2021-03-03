import React from 'react';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import styles from '../styles/styles';
import Text from '../components/Text';
import ONYXKEYS from '../ONYXKEYS';
import Avatar from '../components/Avatar';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import {redirectToLastReport} from '../libs/actions/App';
import HeaderGap from '../components/HeaderGap';
import compose from '../libs/compose';

const personalDetailsType = PropTypes.shape({
    // Display name of the current user from their personal details
    displayName: PropTypes.string,

    // Avatar URL of the current user from their personal details
    avatarURL: PropTypes.string,

    // login of the current user from their personal details
    login: PropTypes.string,

    // pronouns of the current user from their personal details
    pronouns: PropTypes.string,

    // timezone of the current user from their personal details
    timezone: PropTypes.string,
});

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        // login passed via route /profile/:login
        login: PropTypes.string,
    }),
});

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    personalDetails: personalDetailsType.isRequired,

    // Router details
    match: matchType.isRequired,
};

const ProfilePage = ({personalDetails, match}) => {
    const profileDetails = personalDetails[match.params.login];

    return (
        <>
            <HeaderGap />
            <HeaderWithCloseButton
                title="Details"
                onCloseButtonPress={redirectToLastReport}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.profilePageContainer,
                ]}
            >
                {profileDetails ? (
                    <View>
                        <View style={styles.pageWrapper}>
                            <View
                                style={[styles.avatarLarge, styles.mb3]}
                            >
                                <Avatar
                                    style={[styles.avatarLarge]}
                                    source={profileDetails.avatarURL}
                                />
                            </View>
                            <Text style={[styles.displayName, styles.mt1, styles.mb6]} numberOfLines={1}>
                                {profileDetails.displayName
                                    ? profileDetails.displayName
                                    : null}
                            </Text>
                            {profileDetails.login && (
                            <View style={[styles.mb6, styles.profilePageSectionContainer]}>
                                <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                    {Str.isSMSLogin(profileDetails.login) ? 'Phone Number' : 'Email'}
                                </Text>
                                <Text style={[styles.textP]} numberOfLines={1}>
                                    {Str.isSMSLogin(profileDetails.login)
                                        ? Str.removeSMSDomain(profileDetails.login)
                                        : profileDetails.login}
                                </Text>
                            </View>
                            )}
                            {profileDetails.pronouns && (
                            <View style={[styles.mb6, styles.profilePageSectionContainer]}>
                                <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                    Preferred Pronouns
                                </Text>
                                <Text style={[styles.textP]} numberOfLines={1}>
                                    {profileDetails.pronouns}
                                </Text>
                            </View>
                            )}
                            {profileDetails.timezone && (
                            <View style={[styles.mb6, styles.profilePageSectionContainer]}>
                                <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                    Local Time
                                </Text>
                                <Text style={[styles.textP]} numberOfLines={1}>
                                    {moment().tz(profileDetails.timezone).format('LT')}
                                </Text>
                            </View>
                            )}
                        </View>
                    </View>
                ) : null}
            </View>
        </>
    );
};

ProfilePage.propTypes = propTypes;
ProfilePage.displayName = 'ProfilePage';


export default compose(
    withRouter,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ProfilePage);
