import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Text from '../../components/Text';
import {signOut} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import AvatarWithIndicator from '../../components/AvatarWithIndicator';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import {
    Building,
    Gear,
    Info,
    Lock,
    Profile,
    SignOut,
    Wallet,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MenuItem from '../../components/MenuItem';
import ROUTES from '../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import {canCapturePerformanceMetrics, printPerformanceMetrics} from '../../libs/Performance';

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

    /** The list of this user's policies */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The ID of the policy */
        ID: PropTypes.string,

        /** The name of the policy */
        name: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,

        /** The user's role in the policy */
        role: PropTypes.string,
    })),

    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        availableBalance: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    network: {},
    session: {},
    policies: {},
    userWallet: {
        availableBalance: 0,
    },
};

const defaultMenuItems = [
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

// Add the print metrics option to the Settings menu if it is enabled
if (canCapturePerformanceMetrics()) {
    defaultMenuItems.unshift({
        title: 'Print Perf Metrics',
        action: () => printPerformanceMetrics(),
    });
}

const InitialSettingsPage = ({
    myPersonalDetails,
    network,
    numberFormat,
    session,
    policies,
    translate,
    userWallet,
}) => {
    const walletBalance = numberFormat(
        userWallet.availableBalance,
        {style: 'currency', currency: 'USD'},
    );

    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (_.isEmpty(myPersonalDetails)) {
        return null;
    }

    // Add free policies (workspaces) to the list of menu items
    const menuItems = _.chain(policies)
        .filter(policy => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN)
        .map(policy => ({
            title: policy.name,
            icon: policy.avatarURL ? policy.avatarURL : Building,
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
            action: () => Navigation.navigate(ROUTES.getWorkspaceCardRoute(policy.id)),
            iconStyles: [styles.popoverMenuIconEmphasized],
            iconFill: themeColors.iconReversed,
        }))
        .value();
    menuItems.push(...defaultMenuItems);


    const openProfileSettings = () => Navigation.navigate(ROUTES.SETTINGS_PROFILE);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('common.settings')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.settingsPageBackground]} bounces={false}>
                <View style={styles.w100}>
                    <View style={styles.pageWrapper}>
                        <Pressable style={[styles.mb3]} onPress={openProfileSettings}>
                            <AvatarWithIndicator
                                size="large"
                                source={myPersonalDetails.avatar}
                                isActive={network.isOffline === false}
                            />
                        </Pressable>

                        <Pressable style={[styles.mt1]} onPress={openProfileSettings}>
                            <Text style={[styles.displayName]} numberOfLines={1}>
                                {myPersonalDetails.displayName
                                    ? myPersonalDetails.displayName
                                    : Str.removeSMSDomain(session.email)}
                            </Text>
                        </Pressable>
                        {myPersonalDetails.displayName && (
                            <Text
                                style={[styles.textLabelSupporting, styles.mt1]}
                                numberOfLines={1}
                            >
                                {Str.removeSMSDomain(session.email)}
                            </Text>
                        )}
                    </View>
                    {_.map(menuItems, (item, index) => {
                        const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                        const isPaymentItem = item.translationKey === 'common.payments';
                        return (
                            <MenuItem
                                key={`${keyTitle}_${index}`}
                                title={keyTitle}
                                icon={item.icon}
                                iconType={item.iconType}
                                onPress={item.action}
                                iconStyles={item.iconStyles}
                                iconFill={item.iconFill}
                                shouldShowRightIcon
                                badgeText={isPaymentItem ? walletBalance : undefined}
                            />
                        );
                    })}
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
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(InitialSettingsPage);
