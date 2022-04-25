import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import AvatarWithIndicator from '../../components/AvatarWithIndicator';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MenuItem from '../../components/MenuItem';
import ROUTES from '../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import DateUtils from '../../libs/DateUtils';
import Permissions from '../../libs/Permissions';
import networkPropTypes from '../../components/networkPropTypes';

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
    network: networkPropTypes,

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
        currentBalance: PropTypes.number,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    network: {},
    session: {},
    policies: {},
    userWallet: {
        currentBalance: 0,
    },
    betas: [],
};

const defaultMenuItems = [
    {
        translationKey: 'common.profile',
        icon: Expensicons.Profile,
        action: () => {
            DateUtils.updateTimezone();
            Navigation.navigate(ROUTES.SETTINGS_PROFILE);
        },
    },
    {
        translationKey: 'common.preferences',
        icon: Expensicons.Gear,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_PREFERENCES); },
    },
    {
        translationKey: 'initialSettingsPage.security',
        icon: Expensicons.Lock,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_SECURITY); },
    },
    {
        translationKey: 'common.payments',
        icon: Expensicons.Wallet,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_PAYMENTS); },
    },
    {
        translationKey: 'initialSettingsPage.about',
        icon: Expensicons.Info,
        action: () => { Navigation.navigate(ROUTES.SETTINGS_ABOUT); },
    },
    {
        translationKey: 'initialSettingsPage.signOut',
        icon: Expensicons.Exit,
        action: Session.signOutAndRedirectToSignIn,
    },
];

const InitialSettingsPage = (props) => {
    const walletBalance = props.numberFormat(
        props.userWallet.currentBalance / 100, // Divide by 100 because balance is in cents
        {style: 'currency', currency: 'USD'},
    );

    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (_.isEmpty(props.myPersonalDetails)) {
        return null;
    }

    // Add free policies (workspaces) to the list of menu items
    const menuItems = _.chain(props.policies)
        .filter(policy => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN)
        .map(policy => ({
            title: policy.name,
            icon: policy.avatarURL ? policy.avatarURL : Expensicons.Building,
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
            action: () => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policy.id)),
            iconStyles: [styles.popoverMenuIconEmphasized],
            iconFill: themeColors.iconReversed,
        }))
        .value();
    menuItems.push(...defaultMenuItems);

    const openProfileSettings = () => Navigation.navigate(ROUTES.SETTINGS_PROFILE);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('common.settings')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.settingsPageBackground]}>
                <View style={styles.w100}>
                    <View style={styles.pageWrapper}>
                        <Pressable style={[styles.mb3]} onPress={openProfileSettings}>
                            <AvatarWithIndicator
                                size={CONST.AVATAR_SIZE.LARGE}
                                source={props.myPersonalDetails.avatar}
                                isActive={props.network.isOffline === false}
                                tooltipText={props.myPersonalDetails.displayName}
                            />
                        </Pressable>

                        <Pressable style={[styles.mt1, styles.mw100]} onPress={openProfileSettings}>
                            <Text style={[styles.displayName]} numberOfLines={1}>
                                {props.myPersonalDetails.displayName
                                    ? props.myPersonalDetails.displayName
                                    : Str.removeSMSDomain(props.session.email)}
                            </Text>
                        </Pressable>
                        {props.myPersonalDetails.displayName && (
                            <Text
                                style={[styles.textLabelSupporting, styles.mt1]}
                                numberOfLines={1}
                            >
                                {Str.removeSMSDomain(props.session.email)}
                            </Text>
                        )}
                    </View>
                    {_.map(menuItems, (item, index) => {
                        const keyTitle = item.translationKey ? props.translate(item.translationKey) : item.title;
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
                                badgeText={(isPaymentItem && Permissions.canUseWallet(props.betas)) ? walletBalance : undefined}
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
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(InitialSettingsPage);
