import {useNavigationState} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getTopmostCentralPaneName from '@libs/Navigation/getTopmostCentralPanePath';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import walletTermsPropTypes from '@pages/EnablePayments/walletTermsPropTypes';
import CONTEXT_MENU_TYPES from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as PersonalDetails from '@userActions/PersonalDetails';
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

    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of user's cards */
    fundList: PropTypes.objectOf(cardPropTypes),

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

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    session: {},
    userWallet: {
        currentBalance: 0,
    },
    walletTerms: {},
    bankAccountList: {},
    fundList: null,
    loginList: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function InitialSettingsPage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const popoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const activeRoute = useNavigationState(getTopmostCentralPaneName);

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
     * Retuns a list of menu items data for account section
     * @returns {Object} object with translationKey, style and items for the account section
     */
    const accountMenuItemsData = useMemo(() => {
        const profileBrickRoadIndicator = UserUtils.getLoginListBrickRoadIndicator(props.loginList);
        const paymentCardList = props.fundList || {};

        return {
            sectionStyle: styles.accountSettingsSectionContainer,
            sectionTranslationKey: 'initialSettingsPage.account',
            items: [
                {
                    translationKey: 'common.profile',
                    icon: Expensicons.Profile,
                    routeName: ROUTES.SETTINGS_PROFILE,
                    brickRoadIndicator: profileBrickRoadIndicator,
                },
                {
                    translationKey: 'common.wallet',
                    icon: Expensicons.Wallet,
                    routeName: ROUTES.SETTINGS_WALLET,
                    brickRoadIndicator:
                        PaymentMethods.hasPaymentMethodError(props.bankAccountList, paymentCardList) || !_.isEmpty(props.userWallet.errors) || !_.isEmpty(props.walletTerms.errors)
                            ? 'error'
                            : null,
                },
                {
                    translationKey: 'common.shareCode',
                    icon: Expensicons.QrCode,
                    routeName: ROUTES.SETTINGS_SHARE_CODE,
                },
                {
                    translationKey: 'common.preferences',
                    icon: Expensicons.Gear,
                    routeName: ROUTES.SETTINGS_PREFERENCES,
                },
                {
                    translationKey: 'initialSettingsPage.security',
                    icon: Expensicons.Lock,
                    routeName: ROUTES.SETTINGS_SECURITY,
                },
                {
                    translationKey: 'initialSettingsPage.goToExpensifyClassic',
                    icon: Expensicons.NewExpensify,
                    action: () => {
                        Link.openExternalLink(CONST.EXPENSIFY_INBOX_URL);
                    },
                    link: CONST.EXPENSIFY_INBOX_URL,
                },
                {
                    translationKey: 'initialSettingsPage.signOut',
                    icon: Expensicons.Exit,
                    action: () => {
                        signOut(false);
                    },
                },
            ],
        };
    }, [props.bankAccountList, props.fundList, props.loginList, props.userWallet.errors, props.walletTerms.errors, signOut, styles.accountSettingsSectionContainer]);

    /**
     * Retuns a list of menu items data for general section
     * @returns {Object} object with translationKey, style and items for the general section
     */
    const generaltMenuItemsData = useMemo(
        () => ({
            sectionStyle: {
                ...styles.pt4,
            },
            sectionTranslationKey: 'initialSettingsPage.general',
            items: [
                {
                    translationKey: 'initialSettingsPage.help',
                    icon: Expensicons.QuestionMark,
                    action: () => {
                        Link.openExternalLink(CONST.NEWHELP_URL);
                    },
                    link: CONST.NEWHELP_URL,
                },
                {
                    translationKey: 'initialSettingsPage.about',
                    icon: Expensicons.Info,
                    routeName: ROUTES.SETTINGS_ABOUT,
                },
            ],
        }),
        [styles.pt4],
    );

    /**
     * Retuns JSX.Element with menu items
     * @param {Object} menuItemsData list with menu items data
     * @returns {JSX.Element} the menu items for passed data
     */
    const getMenuItemsSection = useCallback(
        (menuItemsData) => {
            /**
             * @param {Boolean} isPaymentItem whether the item being rendered is the payments menu item
             * @returns {String|undefined} the user's wallet balance
             */
            const getWalletBalance = (isPaymentItem) => (isPaymentItem ? CurrencyUtils.convertToDisplayString(props.userWallet.currentBalance) : undefined);
            return (
                <View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
                    <Text style={styles.sectionTitle}>{translate(menuItemsData.sectionTranslationKey)}</Text>
                    {_.map(menuItemsData.items, (item, index) => {
                        const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                        const isPaymentItem = item.translationKey === 'common.wallet';

                        return (
                            <MenuItem
                                key={`${keyTitle}_${index}`}
                                wrapperStyle={styles.sectionMenuItem}
                                title={keyTitle}
                                icon={item.icon}
                                iconType={item.iconType}
                                disabled={isExecuting}
                                onPress={singleExecution(() => {
                                    if (item.action) {
                                        item.action();
                                    } else {
                                        waitForNavigate(() => {
                                            Navigation.navigate(item.routeName);
                                        })();
                                    }
                                })}
                                iconStyles={item.iconStyles}
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
                                focused={activeRoute && activeRoute.startsWith(item.routeName, 1)}
                                isPaneMenu
                            />
                        );
                    })}
                </View>
            );
        },
        [styles.pb4, styles.mh3, styles.sectionTitle, styles.sectionMenuItem, translate, props.userWallet.currentBalance, isExecuting, singleExecution, activeRoute, waitForNavigate],
    );

    const accountMenuItems = useMemo(() => getMenuItemsSection(accountMenuItemsData), [accountMenuItemsData, getMenuItemsSection]);
    const generalMenuItems = useMemo(() => getMenuItemsSection(generaltMenuItemsData), [generaltMenuItemsData, getMenuItemsSection]);

    const currentUserDetails = props.currentUserPersonalDetails || {};
    const avatarURL = lodashGet(currentUserDetails, 'avatar', '');
    const accountID = lodashGet(currentUserDetails, 'accountID', '');

    const headerContent = (
        <View style={[styles.avatarSectionWrapperSettings, styles.justifyContentCenter]}>
            {_.isEmpty(props.currentUserPersonalDetails) || _.isUndefined(props.currentUserPersonalDetails.displayName) ? (
                <CurrentUserPersonalDetailsSkeletonView avatarSize={CONST.AVATAR_SIZE.XLARGE} />
            ) : (
                <>
                    <Tooltip text={translate('common.profile')}>
                        <PressableWithoutFeedback
                            style={styles.mb3}
                            disabled={isExecuting}
                            onPress={singleExecution(openProfileSettings)}
                            accessibilityLabel={translate('common.profile')}
                            role={CONST.ROLE.BUTTON}
                        >
                            <OfflineWithFeedback pendingAction={lodashGet(props.currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                                <AvatarWithImagePicker
                                    isUsingDefaultAvatar={UserUtils.isDefaultAvatar(lodashGet(currentUserDetails, 'avatar', ''))}
                                    source={UserUtils.getAvatar(avatarURL, accountID)}
                                    onImageSelected={PersonalDetails.updateAvatar}
                                    onImageRemoved={PersonalDetails.deleteAvatar}
                                    anchorPosition={styles.createAccountMenuPositionProfile(props.windowWidth)}
                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                    size={CONST.AVATAR_SIZE.XLARGE}
                                    avatarStyle={styles.avatarXLarge}
                                    pendingAction={lodashGet(props.currentUserPersonalDetails, 'pendingFields.avatar', null)}
                                    errors={lodashGet(props.currentUserPersonalDetails, 'errorFields.avatar', null)}
                                    errorRowStyles={[styles.mt6]}
                                    onErrorClose={PersonalDetails.clearAvatarErrors}
                                    previewSource={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
                                    originalFileName={currentUserDetails.originalFileName}
                                    headerTitle={props.translate('profilePage.profileAvatar')}
                                    style={[styles.mh5]}
                                    fallbackIcon={lodashGet(currentUserDetails, 'fallbackIcon')}
                                />
                            </OfflineWithFeedback>
                        </PressableWithoutFeedback>
                    </Tooltip>
                    <PressableWithoutFeedback
                        style={[styles.mt1, styles.w100, styles.mw100]}
                        disabled={isExecuting}
                        onPress={singleExecution(openProfileSettings)}
                        accessibilityLabel={translate('common.profile')}
                        role={CONST.ROLE.LINK}
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
            title={translate('initialSettingsPage.accountSettings')}
            headerContent={headerContent}
            headerContainerStyles={[styles.justifyContentCenter]}
            onBackButtonPress={() => Navigation.closeFullScreen()}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.ROOT].backgroundColor}
            childrenContainerStyles={[styles.m0, styles.p0]}
        >
            <View style={styles.w100}>
                {accountMenuItems}
                {generalMenuItems}
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
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
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
