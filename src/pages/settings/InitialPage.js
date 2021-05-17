import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import {signOut} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import AvatarWithIndicator from '../../components/AvatarWithIndicator';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import {
    Gear,
    Lock,
    Profile,
    Wallet,
    SignOut,
    Info,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MenuItem from '../../components/MenuItem';
import ROUTES from '../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape({
        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,
    }),

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
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
        translationKey: 'common.profile',
        icon: Profile,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_PROFILE); },
    },
    {
        translationKey: 'common.preferences',
        icon: Gear,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_PREFERENCES); },
    },
    {
        translationKey: 'initialSettingsPage.changePassword',
        icon: Lock,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_PASSWORD); },
    },
    {
        translationKey: 'common.payments',
        icon: Wallet,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_PAYMENTS); },
    },
    {
        translationKey: 'initialSettingsPage.about',
        icon: Info,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_ABOUT); },
    },
    {
        translationKey: 'initialSettingsPage.signOut',
        icon: SignOut,
        action: signOut,
    },
];

const InitialSettingsPage = ({
    myPersonalDetails,
    network,
    session,
    translate,
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
                title={translate('initialSettingsPage.settings')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView pointerEvents="box-none" style={[styles.settingsPageBackground]} bounces={false}>
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
                            <Text
                                style={[styles.settingsLoginName, styles.mt1]}
                                numberOfLines={1}
                            >
                                {Str.removeSMSDomain(session.email)}
                            </Text>
                        )}
                    </View>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.title}
                            title={translate(item.translationKey)}
                            icon={item.icon}
                            onPress={() => item.action()}
                            shouldShowRightIcon
                        />
                    ))}
                </View>
            </ScrollView>
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
