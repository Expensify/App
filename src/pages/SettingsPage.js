import React from 'react';
import {
    View,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import {redirect} from '../libs/actions/App';
import styles from '../styles/styles';
import Text from '../components/Text';
import {signOut} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import ROUTES from '../ROUTES';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import {version} from '../../package.json';
import AvatarWithIndicator from '../components/AvatarWithIndicator';

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatarURL: PropTypes.string,
    }),

    // Information about the network
    network: PropTypes.shape({
        // Is the network currently offline or not
        isOffline: PropTypes.bool,
    }),

    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,

    // The session of the logged in person
    session: PropTypes.shape({
    // Email of the logged in person
        email: PropTypes.string,
    }),
};

const defaultProps = {
    myPersonalDetails: {},
    network: null,
    currentlyViewedReportID: '',
    session: {},
};
const SettingsPage = ({
    myPersonalDetails, network, session, currentlyViewedReportID,
}) => {
    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (!myPersonalDetails || _.isEmpty(myPersonalDetails)) {
        return null;
    }
    return (
        <View
            pointerEvents="box-none"
            style={[
                styles.settingsPageBackground,
            ]}
        >
            <View
                style={[
                    styles.flexColumn,
                    styles.settingsPageContainer,
                ]}
            >
                <HeaderWithCloseButton
                    onCloseButtonPress={() => redirect(currentlyViewedReportID !== ''
                        ? ROUTES.getReportRoute(currentlyViewedReportID)
                        : ROUTES.HOME)}
                    title="Settings"
                />
                <View style={styles.settingsWrapper}>
                    <View
                        style={[styles.largeAvatar, styles.mb3]}
                    >
                        <AvatarWithIndicator
                            size="large"
                            source={myPersonalDetails.avatarURL}
                            isActive={network && !network.isOffline}
                        />
                    </View>
                    <Text style={[styles.settingsDisplayName, styles.mt1]} numberOfLines={1}>
                        {myPersonalDetails.displayName ? myPersonalDetails.displayName : session.email}
                    </Text>
                    {myPersonalDetails.displayName && (
                    <Text style={[styles.settingsLoginName, styles.mt1]} numberOfLines={1}>
                        {session.email}
                    </Text>
                    )}
                    <TouchableOpacity
                        onPress={signOut}
                        style={[styles.button, styles.w100, styles.mt5]}
                    >
                        <Text style={[styles.buttonText]}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
            <Text style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                v
                {version}
            </Text>
        </View>
    );
};

SettingsPage.propTypes = propTypes;
SettingsPage.defaultProps = defaultProps;
SettingsPage.displayName = 'SettingsPage';

export default withOnyx({
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    network: {
        key: ONYXKEYS.NETWORK,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(SettingsPage);
