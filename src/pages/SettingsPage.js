import React from 'react';
import {
    TouchableOpacity,
    View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
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
import Account from '../libs/actions/Account';
import Icon from '../components/Icon';
import {DownArrow} from '../components/Icon/Expensicons';
import CONST from '../CONST';
import HeaderGap from '../components/HeaderGap';

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

    // The chat priority mode
    priorityMode: PropTypes.string,
};

const defaultProps = {
    myPersonalDetails: {},
    network: null,
    session: {},
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};


const priorityModes = {
    default: {
        value: CONST.PRIORITY_MODE.DEFAULT,
        label: 'Most Recent',
        description: 'This will display all chats by default, sorted by most recent, with pinned items at the top',
    },
    gsd: {
        value: CONST.PRIORITY_MODE.GSD,
        label: 'GSD',
        description: 'This will only display unread and pinned chats, all sorted alphabetically. Get Shit Done.',
    },
};

const SettingsPage = ({
    myPersonalDetails,
    network,
    session,
    priorityMode,
}) => {
    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (!myPersonalDetails || _.isEmpty(myPersonalDetails)) {
        return null;
    }
    return (
        <>
            <HeaderGap />
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
                    <View style={[styles.settingsPageBody, styles.mt4, styles.mb6]}>
                        <Text style={[styles.formLabel]} numberOfLines={1}>
                            Priority Mode
                        </Text>
                        <View style={[styles.mb2]}>
                            {/* empty object in placeholder below to prevent default */}
                            {/* placeholder from appearing as a selection option. */}
                            <RNPickerSelect
                                onValueChange={Account.updatePriorityMode}
                                items={Object.values(priorityModes)}
                                style={styles.picker}
                                useNativeAndroidPickerStyle={false}
                                placeholder={{}}
                                value={priorityMode}
                                Icon={() => <Icon src={DownArrow} />}
                            />
                        </View>
                        <Text style={[styles.textLabel, styles.colorMuted]}>
                            {priorityModes[priorityMode].description}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={signOut}
                        style={[styles.button, styles.w100, styles.mt5]}
                    >
                        <Text style={[styles.buttonText]}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>
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
    priorityMode: {
        key: ONYXKEYS.PRIORITY_MODE,
    },
})(SettingsPage);
