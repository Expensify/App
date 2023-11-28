import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Avatar from '@components/Avatar';
import bankAccountPropTypes from '@components/bankAccountPropTypes';
import cardPropTypes from '@components/cardPropTypes';
import ConfirmModal from '@components/ConfirmModal';
import CurrentUserPersonalDetailsSkeletonView from '@components/CurrentUserPersonalDetailsSkeletonView';
import HeaderPageLayout from '@components/HeaderPageLayout';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {withNetwork} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import walletTermsPropTypes from '@pages/EnablePayments/walletTermsPropTypes';
import {CONTEXT_MENU_TYPES} from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import policyMemberPropType from '@pages/policyMemberPropType';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Session from '@userActions/Session';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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

    /** List of user's cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Login list for the user that is signed in */
    loginList: PropTypes.objectOf(
        PropTypes.shape({
            /** Date login was validated, used to show brickroad info status */
            validatedDate: PropTypes.string,

            /** Field-specific server side errors keyed by microtime */
            errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        }),
    ),

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
    walletTerms: {},
    bankAccountList: {},
    fundList: null,
    loginList: {},
    allPolicyMembers: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function InitialSettingsPage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
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
                id: policy.id,
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

        const paymentCardList = props.fundList || {};

        return [
            {
                translationKey: 'common.shareCode',
                icon: Expensicons.QrCode,
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_SHARE_CODE);
                }),
            },
            {
                translationKey: 'common.workspaces',
                icon: Expensicons.Building,
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
                }),
                floatRightAvatars: policiesAvatars,
                shouldStackHorizontally: true,
                avatarSize: CONST.AVATAR_SIZE.SMALLER,
                brickRoadIndicator: policyBrickRoadIndicator,
            },
            {
                translationKey: 'common.profile',
                icon: Expensicons.Profile,
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
                }),
                brickRoadIndicator: profileBrickRoadIndicator,
            },
            {
                translationKey: 'common.preferences',
                icon: Expensicons.Gear,
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
                }),
            },
            {
                translationKey: 'initialSettingsPage.security',
                icon: Expensicons.Lock,
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_SECURITY);
                }),
            },
            {
                translationKey: 'common.wallet',
                icon: Expensicons.Wallet,
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_WALLET);
                }),
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
                action: waitForNavigate(() => {
                    Navigation.navigate(ROUTES.SETTINGS_ABOUT);
                }),
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
        props.fundList,
        props.loginList,
        props.network.isOffline,
        props.policies,
        props.reimbursementAccount.errors,
        props.userWallet.errors,
        props.walletTerms.errors,
        signOut,
        waitForNavigate,
    ]);

    const getMenuItems = useMemo(() => {
        /**
         * @param {Boolean} isPaymentItem whether the item being rendered is the payments menu item
         * @returns {Number} the user wallet balance
         */
        const getWalletBalance = (isPaymentItem) => isPaymentItem && CurrencyUtils.convertToDisplayString(props.userWallet.currentBalance);

        return (
            <>
                {_.map(getDefaultMenuItems, (item, index) => {
                    const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                    const isPaymentItem = item.translationKey === 'common.wallet';

                    return (
                        <MenuItem
                            key={`${keyTitle}_${index}`}
                            title={keyTitle}
                            icon={item.icon}
                            iconType={item.iconType}
                            disabled={isExecuting}
                            onPress={singleExecution(item.action)}
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
    }, [getDefaultMenuItems, props.userWallet.currentBalance, translate, isExecuting, singleExecution]);

    const headerContent = (
        <View style={[styles.avatarSectionWrapper, styles.justifyContentCenter]}>
            {_.isEmpty(props.currentUserPersonalDetails) || _.isUndefined(props.currentUserPersonalDetails.displayName) ? (
                <CurrentUserPersonalDetailsSkeletonView
                    backgroundColor={theme.appBG}
                    avatarSize={CONST.AVATAR_SIZE.XLARGE}
                />
            ) : (
                <>
                    <Tooltip text={translate('common.profile')}>
                        <PressableWithoutFeedback
                            style={styles.mb3}
                            disabled={isExecuting}
                            onPress={singleExecution(openProfileSettings)}
                            accessibilityLabel={translate('common.profile')}
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            <OfflineWithFeedback pendingAction={lodashGet(props.currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                                <Avatar
                                    imageStyles={[styles.avatarXLarge]}
                                    source={UserUtils.getAvatar(props.currentUserPersonalDetails.avatar, props.session.accountID)}
                                    size={CONST.AVATAR_SIZE.XLARGE}
                                    fallbackIcon={props.currentUserPersonalDetails.fallbackIcon}
                                />
                            </OfflineWithFeedback>
                        </PressableWithoutFeedback>
                    </Tooltip>
                    <PressableWithoutFeedback
                        style={[styles.mt1, styles.w100, styles.mw100]}
                        disabled={isExecuting}
                        onPress={singleExecution(openProfileSettings)}
                        accessibilityLabel={translate('common.profile')}
                        role={CONST.ACCESSIBILITY_ROLE.LINK}
                    >
                        <Tooltip text={translate('common.profile')}>
                            <Text
                                style={[styles.textHeadline, styles.pre, styles.textAlignCenter]}
                                numberOfLines={1}
                            >
                                {props.currentUserPersonalDetails.displayName ? props.currentUserPersonalDetails.displayName : props.formatPhoneNumber(props.session.email)}
                            </Text>
                        </Tooltip>
                    </PressableWithoutFeedback>
                    {Boolean(props.currentUserPersonalDetails.displayName) && (
                        <Text
                            style={[styles.textLabelSupporting, styles.mt1, styles.w100, styles.textAlignCenter]}
                            numberOfLines={1}
                        >
                            {props.formatPhoneNumber(props.session.email)}
                        </Text>
                    )}
                </>
            )}
        </View>
    );

    return (
        <HeaderPageLayout
            title={translate('common.settings')}
            headerContent={headerContent}
            headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentCenter]}
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.ROOT]}
        >
            <View style={styles.w100}>
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
        </HeaderPageLayout>
    );
}

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
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
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
