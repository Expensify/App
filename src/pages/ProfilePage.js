import React from 'react';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import styles from '../styles/styles';
import Text from '../components/Text';
import ONYXKEYS from '../ONYXKEYS';
import Avatar from '../components/Avatar';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import {redirectToLastReport} from '../libs/actions/App';
import HeaderGap from '../components/HeaderGap';
import compose from '../libs/compose';
import {version} from '../../package.json';

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

const reportType = PropTypes.shape({
    reportID: PropTypes.number,
    reportName: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.string),
    icons: PropTypes.arrayOf(PropTypes.string),
});

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    personalDetails: personalDetailsType.isRequired,

    // reports based on currentlyViewedReportID
    report: reportType.isRequired,
};

const ProfilePage = ({personalDetails, report}) => {
    const login = report.participants[0];
    const profileDetails = personalDetails[login] || {
        login,
        avatarURL: report.icons[0],
    };

    return (
        <>
            <HeaderGap />
            <HeaderWithCloseButton
                onCloseButtonPress={redirectToLastReport}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.profilePageContainer,
                ]}
            >
                <View>
                    <View style={styles.settingsWrapper}>
                        <View
                            style={[styles.avatarLarge, styles.mb3]}
                        >
                            <Avatar
                                style={[styles.avatarLarge]}
                                source={profileDetails.avatarURL}
                            />
                        </View>
                        <Text style={[styles.settingsDisplayName, styles.mt1, styles.mb6]} numberOfLines={1}>
                            {profileDetails.displayName
                                ? profileDetails.displayName
                                : null}
                        </Text>
                        {profileDetails.login && (
                        <View style={[styles.mb6, styles.profilePageSectionContainer]}>
                            <Text style={[styles.profilePageLabel, styles.mb2]} numberOfLines={1}>
                                {Str.isSMSLogin(profileDetails.login) ? 'Phone Number' : 'Email'}
                            </Text>
                            <Text style={[styles.profilePageLabel]} numberOfLines={1}>
                                {Str.isSMSLogin(profileDetails.login)
                                    ? Str.removeSMSDomain(profileDetails.login)
                                    : profileDetails.login}
                            </Text>
                        </View>
                        )}
                        {profileDetails.pronouns && (
                        <View style={[styles.mb6, styles.profilePageSectionContainer]}>
                            <Text style={[styles.profilePageLabel, styles.mb2]} numberOfLines={1}>
                                Preferred Pronouns
                            </Text>
                            <Text style={[styles.profilePageLabel]} numberOfLines={1}>
                                {profileDetails.pronouns}
                            </Text>
                        </View>
                        )}
                        {profileDetails.timezone && (
                        <View style={[styles.mb6, styles.profilePageSectionContainer]}>
                            <Text style={[styles.profilePageLabel, styles.mb2]} numberOfLines={1}>
                                Local Time
                            </Text>
                            <Text style={[styles.profilePageLabel]} numberOfLines={1}>
                                {moment().tz(profileDetails.timezone).format('LT')}
                            </Text>
                        </View>
                        )}
                    </View>
                </View>

                <Text style={[styles.profilePageSectionVersion]} numberOfLines={1}>
                    v
                    {version}
                </Text>
            </View>
        </>
    );
};

ProfilePage.propTypes = propTypes;
ProfilePage.displayName = 'ProfilePage';


export default compose(
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
    withOnyx({
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
    withOnyx({
        report: {
            key: ({currentlyViewedReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${currentlyViewedReportID}`,
        },
    }),
)(ProfilePage);
