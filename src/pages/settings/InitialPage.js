import React from 'react';
import {
    TouchableOpacity,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import {signOut} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import {version} from '../../../package.json';
import AvatarWithIndicator from '../../components/AvatarWithIndicator';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import {
    Gear, Lock, Profile, Wallet,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MenuItem from '../../components/MenuItem';
import ROUTES from '../../ROUTES';
import openURLInNewTab from '../../libs/openURLInNewTab';
import CONST from '../../CONST';

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatar: PropTypes.string,
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
    network: {},
    session: {},
};

const menuItems = [
    {
        title: 'Profile',
        icon: Profile,
        route: ROUTES.SETTINGS_PROFILE,
    },
    {
        title: 'Preferences',
        icon: Gear,
        route: ROUTES.SETTINGS_PREFERENCES,
    },
    {
        title: 'Change Password',
        icon: Lock,
        route: ROUTES.SETTINGS_PASSWORD,
    },
    {
        title: 'Payments',
        icon: Wallet,
        route: ROUTES.SETTINGS_PAYMENTS,
    },
];

const InitialSettingsPage = ({
    myPersonalDetails,
    network,
    session,
}) => {
    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (_.isEmpty(myPersonalDetails)) {
        return null;
    }
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title="Settings"
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.settingsPageBackground,
                ]}
            >
                <View style={styles.w100}>
                    <View style={styles.pageWrapper}>

                        <View style={[styles.mb3]}>
                            <AvatarWithIndicator
                                size="large"
                                source={myPersonalDetails.avatar}
                                isActive={network.isOffline === false}
                            />
                        </View>
                        <Text style={[styles.displayName, styles.mt1]} numberOfLines={1}>
                            {myPersonalDetails.displayName
                                ? myPersonalDetails.displayName
                                : Str.removeSMSDomain(session.email)}
                        </Text>
                        {myPersonalDetails.displayName && (
                        <Text style={[styles.settingsLoginName, styles.mt1]} numberOfLines={1}>
                            {Str.removeSMSDomain(session.email)}
                        </Text>
                        )}
                    </View>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                            onPress={() => Navigation.navigate(item.route)}
                            shouldShowRightArrow
                        />
                    ))}
                    <View style={[styles.ph5]}>
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
                <View style={[styles.sidebarFooter]}>
                    <Text style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                        v
                        {version}
                    </Text>
                    <Text style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                        Read the
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => openURLInNewTab(CONST.TERMS_URL)}
                        >
                            terms of service
                        </Text>
                        {' '}
                        and
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
                        >
                            privacy policy
                        </Text>
                        .
                    </Text>
                </View>
            </View>
        </ScreenWrapper>
    );
};

InitialSettingsPage.propTypes = propTypes;
InitialSettingsPage.defaultProps = defaultProps;
InitialSettingsPage.displayName = 'InitialSettingsPage';

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
})(InitialSettingsPage);
