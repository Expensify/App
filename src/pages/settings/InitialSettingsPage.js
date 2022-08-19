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
import Tooltip from '../../components/Tooltip';
import Avatar from '../../components/Avatar';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MenuItem from '../../components/MenuItem';
import ROUTES from '../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import Permissions from '../../libs/Permissions';
import * as App from '../../libs/actions/App';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import * as PolicyUtils from '../../libs/PolicyUtils';
import policyMemberPropType from '../policyMemberPropType';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import bankAccountPropTypes from '../../components/bankAccountPropTypes';
import cardPropTypes from '../../components/cardPropTypes';

const propTypes = {
    /* Onyx Props */

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

    /** List of policy members */
    policyMembers: PropTypes.objectOf(policyMemberPropType),

    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    session: {},
    policies: {},
    userWallet: {
        currentBalance: 0,
    },
    betas: [],
    policyMembers: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const InitialSettingsPage = (props) => {
    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (_.isEmpty(props.currentUserPersonalDetails)) {
        return null;
    }

    const walletBalance = props.numberFormat(
        props.userWallet.currentBalance / 100, // Divide by 100 because balance is in cents
        {style: 'currency', currency: 'USD'},
    );

    const defaultMenuItems = [
        {
            translationKey: 'common.profile',
            icon: Expensicons.Profile,
            action: () => { App.openProfile(); },
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
            brickRoadIndicator: PaymentMethods.hasPaymentMethodError(props.bankAccountList, props.cardList) || !_.isEmpty(props.userWallet.errors) ? 'error' : null,
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

    // Add free policies (workspaces) to the list of menu items
    const menuItems = _.chain(props.policies)
        .filter(policy => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN)
        .map(policy => ({
            title: policy.name,
            icon: policy.avatarURL ? policy.avatarURL : Expensicons.Building,
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
            action: () => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policy.id)),
            iconStyles: policy.avatarURL ? [] : [styles.popoverMenuIconEmphasized],
            iconFill: themeColors.iconReversed,
            fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
            brickRoadIndicator: PolicyUtils.getWorkspaceBrickRoadIndicatorStatus(policy, props.policyMembers),
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
                            <Tooltip text={props.currentUserPersonalDetails.displayName}>
                                <Avatar
                                    imageStyles={[styles.avatarLarge]}
                                    source={props.currentUserPersonalDetails.avatar}
                                    size={CONST.AVATAR_SIZE.LARGE}
                                />
                            </Tooltip>
                        </Pressable>

                        <Pressable style={[styles.mt1, styles.mw100]} onPress={openProfileSettings}>
                            <Text style={[styles.displayName]} numberOfLines={1}>
                                {props.currentUserPersonalDetails.displayName
                                    ? props.currentUserPersonalDetails.displayName
                                    : Str.removeSMSDomain(props.session.email)}
                            </Text>
                        </Pressable>
                        {props.currentUserPersonalDetails.displayName && (
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
                                fallbackIcon={item.fallbackIcon}
                                brickRoadIndicator={item.brickRoadIndicator}
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
    withCurrentUserPersonalDetails,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        policyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
    }),
)(InitialSettingsPage);
