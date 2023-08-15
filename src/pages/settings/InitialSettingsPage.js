import lodashGet from 'lodash/get';
import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import CurrentUserPersonalDetailsSkeletonView from '../../components/CurrentUserPersonalDetailsSkeletonView';
import {withNetwork} from '../../components/OnyxProvider';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import Tooltip from '../../components/Tooltip';
import Avatar from '../../components/Avatar';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MenuItem from '../../components/MenuItem';
import ROUTES from '../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import Permissions from '../../libs/Permissions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../components/withCurrentUserPersonalDetails';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import bankAccountPropTypes from '../../components/bankAccountPropTypes';
import cardPropTypes from '../../components/cardPropTypes';
import * as Wallet from '../../libs/actions/Wallet';
import walletTermsPropTypes from '../EnablePayments/walletTermsPropTypes';
import * as PolicyUtils from '../../libs/PolicyUtils';
import ConfirmModal from '../../components/ConfirmModal';
import * as ReportUtils from '../../libs/ReportUtils';
import * as Link from '../../libs/actions/Link';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import * as ReimbursementAccountProps from '../ReimbursementAccount/reimbursementAccountPropTypes';
import * as UserUtils from '../../libs/UserUtils';
import policyMemberPropType from '../policyMemberPropType';
import * as ReportActionContextMenu from '../home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../home/report/ContextMenu/ContextMenuActions';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import PressableWithoutFeedback from '../../components/Pressable/PressableWithoutFeedback';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /* Onyx Props */

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),

    /** The list of this user's policies */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the policy */
            ID: PropTypes.string,

            /** The name of the policy */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,

            /** The user's role in the policy */
            role: PropTypes.string,

            /** The current action that is waiting to happen on the policy */
            pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        }),
    ),

    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),

    /** List of cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Date login was validated, used to show brickroad info status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /** Members keyed by accountID for all policies */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    session: {},
    policies: {},
    userWallet: {
        currentBalance: 0,
    },
    reimbursementAccount: {},
    betas: [],
    walletTerms: {},
    bankAccountList: {},
    cardList: null,
    fundList: null,
    loginList: {},
    allPolicyMembers: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function InitialSettingsPage(props) {
    const popoverAnchor = useRef(null);
    const {translate} = useLocalize();

    const [shouldShowSignoutConfirmModal, setShouldShowSignoutConfirmModal] = useState(false);

    useEffect(() => {
        Wallet.openInitialSettingsPage();
    }, []);

    const toggleSignoutConfirmModal = (value) => {
        setShouldShowSignoutConfirmModal(value);
    };

    const openProfileSettings = () => {
        Navigation.navigate(ROUTES.SETTINGS_PROFILE);
    };

    const signOut = useCallback(
        (shouldForceSignout = false) => {
            if (!props.network.isOffline || shouldForceSignout) {
                Session.signOutAndRedirectToSignIn();
                return;
            }

            // When offline, warn the user that any actions they took while offline will be lost if they sign out
            toggleSignoutConfirmModal(true);
        },
        [props.network.isOffline],
    );

    /**
     * Retuns a list of default menu items
     * @returns {Array} the default menu items
     */
    const getDefaultMenuItems = useMemo(() => {
        const policiesAvatars = _.chain(props.policies)
            .filter((policy) => PolicyUtils.shouldShowPolicy(policy, props.network.isOffline))
            .sortBy((policy) => policy.name.toLowerCase())
            .map((policy) => ({
                source: policy.avatar || ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                name: policy.name,
                type: CONST.ICON_TYPE_WORKSPACE,
            }))
            .value();

        const policyBrickRoadIndicator =
            !_.isEmpty(props.reimbursementAccount.errors) ||
            _.chain(props.policies)
                .filter((policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN)
                .some((policy) => PolicyUtils.hasPolicyError(policy) || PolicyUtils.getPolicyBrickRoadIndicatorStatus(policy, props.allPolicyMembers))
                .value()
                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                : null;
        const profileBrickRoadIndicator = UserUtils.getLoginListBrickRoadIndicator(props.loginList);

        const paymentCardList = props.fundList || props.cardList || {};

        return [
            {
                translationKey: 'common.shareCode',
                icon: Expensicons.QrCode,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_SHARE_CODE);
                },
            },
            {
                translationKey: 'common.workspaces',
                icon: Expensicons.Building,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
                },
                floatRightAvatars: policiesAvatars,
                shouldStackHorizontally: true,
                avatarSize: CONST.AVATAR_SIZE.SMALLER,
                brickRoadIndicator: policyBrickRoadIndicator,
            },
            {
                translationKey: 'common.profile',
                icon: Expensicons.Profile,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
                },
                brickRoadIndicator: profileBrickRoadIndicator,
            },
            {
                translationKey: 'common.preferences',
                icon: Expensicons.Gear,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
                },
            },
            {
                translationKey: 'initialSettingsPage.security',
                icon: Expensicons.Lock,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_SECURITY);
                },
            },
            {
                translationKey: 'common.payments',
                icon: Expensicons.Wallet,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
                },
                brickRoadIndicator:
                    PaymentMethods.hasPaymentMethodError(props.bankAccountList, paymentCardList) || !_.isEmpty(props.userWallet.errors) || !_.isEmpty(props.walletTerms.errors)
                        ? 'error'
                        : null,
            },
            {
                translationKey: 'initialSettingsPage.help',
                icon: Expensicons.QuestionMark,
                action: () => {
                    Link.openExternalLink(CONST.NEWHELP_URL);
                },
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                link: CONST.NEWHELP_URL,
            },
            {
                translationKey: 'initialSettingsPage.about',
                icon: Expensicons.Info,
                action: () => {
                    Navigation.navigate(ROUTES.SETTINGS_ABOUT);
                },
            },
            {
                translationKey: 'initialSettingsPage.signOut',
                icon: Expensicons.Exit,
                action: () => {
                    signOut(false);
                },
            },
        ];
    }, [
        props.allPolicyMembers,
        props.bankAccountList,
        props.cardList,
        props.fundList,
        props.loginList,
        props.network.isOffline,
        props.policies,
        props.reimbursementAccount.errors,
        props.userWallet.errors,
        props.walletTerms.errors,
        signOut,
    ]);

    const getMenuItems = useMemo(() => {
        /**
         * @param {Boolean} isPaymentItem whether the item being rendered is the payments menu item
         * @returns {Number} the user wallet balance
         */
        const getWalletBalance = (isPaymentItem) =>
            isPaymentItem && Permissions.canUseWallet(props.betas) ? CurrencyUtils.convertToDisplayString(props.userWallet.currentBalance) : undefined;

        return (
            <>
                {_.map(getDefaultMenuItems, (item, index) => {
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
                            shouldShowRightIcon
                            iconRight={item.iconRight}
                            badgeText={getWalletBalance(isPaymentItem)}
                            fallbackIcon={item.fallbackIcon}
                            brickRoadIndicator={item.brickRoadIndicator}
                            floatRightAvatars={item.floatRightAvatars}
                            shouldStackHorizontally={item.shouldStackHorizontally}
                            floatRightAvatarSize={item.avatarSize}
                            ref={popoverAnchor}
                            shouldBlockSelection={Boolean(item.link)}
                            onSecondaryInteraction={
                                !_.isEmpty(item.link) ? (e) => ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, item.link, popoverAnchor.current) : undefined
                            }
                        />
                    );
                })}
            </>
        );
    }, [getDefaultMenuItems, props.betas, props.userWallet.currentBalance, translate]);

    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (_.isEmpty(props.currentUserPersonalDetails)) {
        return null;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton title={translate('common.settings')} />
                    <ScrollView
                        contentContainerStyle={safeAreaPaddingBottomStyle}
                        style={[styles.settingsPageBackground]}
                    >
                        <View style={styles.w100}>
                            {_.isEmpty(props.currentUserPersonalDetails) || _.isUndefined(props.currentUserPersonalDetails.displayName) ? (
                                <CurrentUserPersonalDetailsSkeletonView />
                            ) : (
                                <View style={styles.avatarSectionWrapper}>
                                    <Tooltip text={translate('common.profile')}>
                                        <PressableWithoutFeedback
                                            style={[styles.mb3]}
                                            onPress={openProfileSettings}
                                            accessibilityLabel={translate('common.profile')}
                                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                        >
                                            <OfflineWithFeedback pendingAction={lodashGet(props.currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                                                <Avatar
                                                    imageStyles={[styles.avatarLarge]}
                                                    source={UserUtils.getAvatar(props.currentUserPersonalDetails.avatar, props.session.accountID)}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                />
                                            </OfflineWithFeedback>
                                        </PressableWithoutFeedback>
                                    </Tooltip>
                                    <PressableWithoutFeedback
                                        style={[styles.mt1, styles.mw100]}
                                        onPress={openProfileSettings}
                                        accessibilityLabel={translate('common.profile')}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                                    >
                                        <Tooltip text={translate('common.profile')}>
                                            <Text
                                                style={[styles.textHeadline, styles.pre]}
                                                numberOfLines={1}
                                            >
                                                {props.currentUserPersonalDetails.displayName ? props.currentUserPersonalDetails.displayName : props.formatPhoneNumber(props.session.email)}
                                            </Text>
                                        </Tooltip>
                                    </PressableWithoutFeedback>
                                    {Boolean(props.currentUserPersonalDetails.displayName) && (
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mt1]}
                                            numberOfLines={1}
                                        >
                                            {props.formatPhoneNumber(props.session.email)}
                                        </Text>
                                    )}
                                </View>
                            )}
                            {getMenuItems}

                            <ConfirmModal
                                danger
                                title={translate('common.areYouSure')}
                                prompt={translate('initialSettingsPage.signOutConfirmationText')}
                                confirmText={translate('initialSettingsPage.signOut')}
                                cancelText={translate('common.cancel')}
                                isVisible={shouldShowSignoutConfirmModal}
                                onConfirm={() => signOut(true)}
                                onCancel={() => toggleSignoutConfirmModal(false)}
                            />
                        </View>
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

InitialSettingsPage.propTypes = propTypes;
InitialSettingsPage.defaultProps = defaultProps;

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
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
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
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        fundList: {
            key: ONYXKEYS.FUND_LIST,
        },
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
    withNetwork(),
)(InitialSettingsPage);
