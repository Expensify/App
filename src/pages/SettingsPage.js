import React from 'react';
import {
    View,
    TouchableOpacity,
    Picker,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../styles/styles';
import Text from '../components/Text';
import {signOut} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import {version} from '../../package.json';
import AvatarWithIndicator from '../components/AvatarWithIndicator';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import {redirectToLastReport} from '../libs/actions/App';

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

    // The session of the logged in person
    session: PropTypes.shape({
        // Email of the logged in person
        email: PropTypes.string,
    }),
};

const defaultProps = {
    myPersonalDetails: {},
    network: null,
    session: {},
};
const SettingsPage = ({
    myPersonalDetails,
    network,
    session,
}) => {
    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (!myPersonalDetails || _.isEmpty(myPersonalDetails)) {
        return null;
    }
    return (
        <>
            <HeaderWithCloseButton
                title="Settings"
                onCloseButtonPress={redirectToLastReport}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.settingsPageBackground,
                ]}
            >
                <View style={styles.settingsWrapper}>
                    <View
                        style={[styles.mb3]}
                    >
                        <AvatarWithIndicator
                            size="large"
                            source={myPersonalDetails.avatarURL}
                            isActive={network && !network.isOffline}
                        />
                    </View>
                    <Text style={[styles.settingsDisplayName, styles.mt1]} numberOfLines={1}>
                        {myPersonalDetails.displayName
                            ? myPersonalDetails.displayName
                            : Str.removeSMSDomain(session.email)}
                    </Text>
                    {myPersonalDetails.displayName && (
                        <Text style={[styles.settingsLoginName, styles.mt1]} numberOfLines={1}>
                            {Str.removeSMSDomain(session.email)}
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
                    <View style={[styles.settingsPageBody, styles.mt6]}>
                        <Text style={[styles.settingsPageHeading, styles.mt2, styles.mb4]} numberOfLines={1}>
                            Chats
                        </Text>
                        <Text style={[styles.textP]}>
                            How should we display chats on your home screen?
                        </Text>
                        <Picker style={[styles.picker, styles.w100, styles.mt2, styles.mb2]}>
                            <Picker.Item label="Most Recent" value="default" />
                            <Picker.Item label="GSD" value="gsd" />
                        </Picker>
                        <Text style={[styles.textP, styles.colorMuted]}>
                            This will display all chats by default, sorted by most recent, with pinned items at the top
                        </Text>
                    </View>
                </View>
                <Text style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                    v
                    {version}
                </Text>
            </View>
        </>
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
})(SettingsPage);
