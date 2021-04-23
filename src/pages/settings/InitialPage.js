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
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    network: {},
    session: {},
};

const menuItems = [
    {
        title: 'profile',
        icon: Profile,
        route: ROUTES.SETTINGS_PROFILE,
    },
    {
        title: 'preferences',
        icon: Gear,
        route: ROUTES.SETTINGS_PREFERENCES,
    },
    {
        title: 'changePassword',
        icon: Lock,
        route: ROUTES.SETTINGS_PASSWORD,
    },
    {
        title: 'payments',
        icon: Wallet,
        route: ROUTES.SETTINGS_PAYMENTS,
    },
];

const InitialSettingsPage = ({
    myPersonalDetails,
    network,
    session,
    translations,
}) => {
    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (_.isEmpty(myPersonalDetails)) {
        return null;
    }
    const {translate} = translations;
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('settings')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
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
                            title={translate(item.title)}
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
                                {translate('signOut')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.sidebarFooter]}>
                    <Text style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                        {translate('versionLetter')}
                        {version}
                    </Text>
                    <Text style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                        {translate('readTheTermsAndPrivacyPolicy')[0]}
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => openURLInNewTab(CONST.TERMS_URL)}
                        >
                            {translate('readTheTermsAndPrivacyPolicy')[1]}
                        </Text>
                        {' '}
                        {translate('readTheTermsAndPrivacyPolicy')[2]}
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
                        >
                            {translate('readTheTermsAndPrivacyPolicy')[3]}
                        </Text>
                        {translate('readTheTermsAndPrivacyPolicy')[4]}
                    </Text>
                </View>
            </View>
        </ScreenWrapper>
    );
};

InitialSettingsPage.propTypes = propTypes;
InitialSettingsPage.defaultProps = defaultProps;
InitialSettingsPage.displayName = 'InitialSettingsPage';

export default compose(
    withLocalize,
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        network: {
            key: ONYXKEYS.NETWORK,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(InitialSettingsPage);
