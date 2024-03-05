import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {NativeModules, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import ConfirmModal from '@components/ConfirmModal';
import CurrentUserPersonalDetailsSkeletonView from '@components/CurrentUserPersonalDetailsSkeletonView';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getTopmostSettingsCentralPaneName from '@libs/Navigation/getTopmostSettingsCentralPaneName';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as PersonalDetails from '@userActions/PersonalDetails';
import * as Session from '@userActions/Session';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type InitialSettingsPageOnyxProps = {
    /** The user's session */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The user's wallet account */
    userWallet: OnyxEntry<OnyxTypes.UserWallet>;

    /** List of bank accounts */
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>;

    /** List of user's cards */
    fundList: OnyxEntry<OnyxTypes.FundList>;

    /** Information about the user accepting the terms for payments */
    walletTerms: OnyxEntry<OnyxTypes.WalletTerms>;

    /** Login list for the user that is signed in */
    loginList: OnyxEntry<OnyxTypes.LoginList>;
};

type InitialSettingsPageProps = InitialSettingsPageOnyxProps & WithCurrentUserPersonalDetailsProps;

type MenuData = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    routeName?: Route;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action?: () => void;
    link?: string | (() => Promise<string>);
    iconType?: typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    iconStyles?: StyleProp<ViewStyle>;
    fallbackIcon?: IconAsset;
    shouldStackHorizontally?: boolean;
    avatarSize?: (typeof CONST.AVATAR_SIZE)[keyof typeof CONST.AVATAR_SIZE];
    floatRightAvatars?: TIcon[];
    title?: string;
    shouldShowRightIcon?: boolean;
    iconRight?: IconAsset;
};

type Menu = {sectionStyle: StyleProp<ViewStyle>; sectionTranslationKey: TranslationPaths; items: MenuData[]};

function InitialSettingsPage({session, userWallet, bankAccountList, fundList, walletTerms, loginList, currentUserPersonalDetails}: InitialSettingsPageProps) {
    const network = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const popoverAnchor = useRef(null);
    const {translate, formatPhoneNumber} = useLocalize();
    const activeRoute = useNavigationState(getTopmostSettingsCentralPaneName);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';

    const [shouldShowSignoutConfirmModal, setShouldShowSignoutConfirmModal] = useState(false);

    useEffect(() => {
        Wallet.openInitialSettingsPage();
    }, []);

    const toggleSignoutConfirmModal = (value: boolean) => {
        setShouldShowSignoutConfirmModal(value);
    };

    const signOut = useCallback(
        (shouldForceSignout = false) => {
            if (!network.isOffline || shouldForceSignout) {
                Session.signOutAndRedirectToSignIn();
                return;
            }

            // When offline, warn the user that any actions they took while offline will be lost if they sign out
            toggleSignoutConfirmModal(true);
        },
        [network.isOffline],
    );

    /**
     * Retuns a list of menu items data for account section
     * @returns object with translationKey, style and items for the account section
     */
    const accountMenuItemsData: Menu = useMemo(() => {
        const profileBrickRoadIndicator = UserUtils.getLoginListBrickRoadIndicator(loginList);
        const paymentCardList = fundList;
        const signOutTranslationKey = Session.isSupportAuthToken() && Session.hasStashedSession() ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
        const defaultMenu: Menu = {
            sectionStyle: styles.accountSettingsSectionContainer,
            sectionTranslationKey: 'initialSettingsPage.account',
            items: [
                {
                    translationKey: 'exitSurvey.goToExpensifyClassic',
                    icon: Expensicons.ExpensifyLogoNew,
                    routeName: ROUTES.SETTINGS_EXIT_SURVEY_REASON,
                },
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
                        PaymentMethods.hasPaymentMethodError(bankAccountList, paymentCardList) || !isEmptyObject(userWallet?.errors) || !isEmptyObject(walletTerms?.errors)
                            ? 'error'
                            : undefined,
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
                    translationKey: signOutTranslationKey,
                    icon: Expensicons.Exit,
                    action: () => {
                        signOut(false);
                    },
                },
            ],
        };

        if (NativeModules.HybridAppModule) {
            const hybridAppMenuItems: MenuData[] = [
                {
                    translationKey: 'initialSettingsPage.returnToClassic' as const,
                    icon: Expensicons.RotateLeft,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    action: () => {
                        NativeModules.HybridAppModule.closeReactNativeApp();
                    },
                },
                ...defaultMenu.items,
            ].filter((item) => item.translationKey !== 'initialSettingsPage.signOut' && item.translationKey !== 'exitSurvey.goToExpensifyClassic');

            return {sectionStyle: styles.accountSettingsSectionContainer, sectionTranslationKey: 'initialSettingsPage.account', items: hybridAppMenuItems};
        }

        return defaultMenu;
    }, [loginList, fundList, styles.accountSettingsSectionContainer, bankAccountList, userWallet?.errors, walletTerms?.errors, signOut]);

    /**
     * Retuns a list of menu items data for general section
     * @returns object with translationKey, style and items for the general section
     */
    const generalMenuItemsData: Menu = useMemo(
        () => ({
            sectionStyle: {
                ...styles.pt4,
            },
            sectionTranslationKey: 'initialSettingsPage.general' as const,
            items: [
                {
                    translationKey: 'initialSettingsPage.help' as const,
                    icon: Expensicons.QuestionMark,
                    action: () => {
                        Link.openExternalLink(CONST.NEWHELP_URL);
                    },
                    iconRight: Expensicons.NewWindow,
                    shouldShowRightIcon: true,
                    link: CONST.NEWHELP_URL,
                },
                {
                    translationKey: 'initialSettingsPage.about' as const,
                    icon: Expensicons.Info,
                    routeName: ROUTES.SETTINGS_ABOUT,
                },
            ],
        }),
        [styles.pt4],
    );

    /**
     * Retuns JSX.Element with menu items
     * @param menuItemsData list with menu items data
     * @returns the menu items for passed data
     */
    const getMenuItemsSection = useCallback(
        (menuItemsData: Menu) => {
            /**
             * @param isPaymentItem whether the item being rendered is the payments menu item
             * @returns the user's wallet balance
             */
            const getWalletBalance = (isPaymentItem: boolean): string | undefined => (isPaymentItem ? CurrencyUtils.convertToDisplayString(userWallet?.currentBalance) : undefined);

            const openPopover = (link: string | (() => Promise<string>) | undefined, event: GestureResponderEvent | MouseEvent) => {
                if (typeof link === 'function') {
                    link?.()?.then((url) => ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, url, popoverAnchor.current));
                } else if (link) {
                    ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, link, popoverAnchor.current);
                }
            };

            return (
                <View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
                    <Text style={styles.sectionTitle}>{translate(menuItemsData.sectionTranslationKey)}</Text>
                    {menuItemsData.items.map((item) => {
                        const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                        const isPaymentItem = item.translationKey === 'common.wallet';

                        return (
                            <MenuItem
                                key={keyTitle}
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
                                hoverAndPressStyle={styles.hoveredComponentBG}
                                shouldBlockSelection={Boolean(item.link)}
                                onSecondaryInteraction={item.link ? (event) => openPopover(item.link, event) : undefined}
                                focused={!!activeRoute && !!item.routeName && !!(activeRoute.toLowerCase().replaceAll('_', '') === item.routeName.toLowerCase().replaceAll('/', ''))}
                                isPaneMenu
                                iconRight={item.iconRight}
                                shouldShowRightIcon={item.shouldShowRightIcon}
                            />
                        );
                    })}
                </View>
            );
        },
        [
            styles.pb4,
            styles.mh3,
            styles.sectionTitle,
            styles.sectionMenuItem,
            styles.hoveredComponentBG,
            translate,
            userWallet?.currentBalance,
            isExecuting,
            singleExecution,
            activeRoute,
            waitForNavigate,
        ],
    );

    const accountMenuItems = useMemo(() => getMenuItemsSection(accountMenuItemsData), [accountMenuItemsData, getMenuItemsSection]);
    const generalMenuItems = useMemo(() => getMenuItemsSection(generalMenuItemsData), [generalMenuItemsData, getMenuItemsSection]);

    const currentUserDetails = currentUserPersonalDetails;
    const avatarURL = currentUserDetails?.avatar ?? '';
    const accountID = currentUserDetails?.accountID ?? '';

    const headerContent = (
        <View style={[styles.avatarSectionWrapperSettings, styles.justifyContentCenter, styles.ph5]}>
            {isEmptyObject(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined ? (
                <CurrentUserPersonalDetailsSkeletonView avatarSize={CONST.AVATAR_SIZE.XLARGE} />
            ) : (
                <>
                    <View style={[styles.flexRow, styles.w100, styles.justifyContentBetween, styles.alignItemsCenter, styles.pb5]}>
                        <Tooltip text={translate('common.shareCode')}>
                            <PressableWithFeedback
                                accessibilityLabel={translate('common.shareCode')}
                                accessibilityRole="button"
                                accessible
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_SHARE_CODE)}
                            >
                                <View style={styles.primaryMediumIcon}>
                                    <Icon
                                        src={Expensicons.QrCode}
                                        width={variables.iconSizeNormal}
                                        height={variables.iconSizeNormal}
                                        fill={theme.icon}
                                    />
                                </View>
                            </PressableWithFeedback>
                        </Tooltip>
                        <Tooltip text={translate('statusPage.status')}>
                            <PressableWithFeedback
                                accessibilityLabel={translate('statusPage.status')}
                                accessibilityRole="button"
                                accessible
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS)}
                            >
                                <View style={styles.primaryMediumIcon}>
                                    {emojiCode ? (
                                        <Text style={styles.primaryMediumText}>{emojiCode}</Text>
                                    ) : (
                                        <Icon
                                            src={Expensicons.Emoji}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                            fill={theme.icon}
                                        />
                                    )}
                                </View>
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                    <OfflineWithFeedback
                        pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}
                        style={[styles.mb3, styles.w100]}
                    >
                        <AvatarWithImagePicker
                            isUsingDefaultAvatar={UserUtils.isDefaultAvatar(currentUserDetails?.avatar ?? '')}
                            source={UserUtils.getAvatar(avatarURL, accountID)}
                            onImageSelected={PersonalDetails.updateAvatar}
                            onImageRemoved={PersonalDetails.deleteAvatar}
                            size={CONST.AVATAR_SIZE.XLARGE}
                            avatarStyle={styles.avatarXLarge}
                            pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}
                            errors={currentUserPersonalDetails?.errorFields?.avatar ?? null}
                            errorRowStyles={styles.mt6}
                            onErrorClose={PersonalDetails.clearAvatarErrors}
                            onViewPhotoPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(String(accountID)))}
                            previewSource={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
                            originalFileName={currentUserDetails.originalFileName}
                            headerTitle={translate('profilePage.profileAvatar')}
                            fallbackIcon={currentUserDetails?.fallbackIcon}
                        />
                    </OfflineWithFeedback>
                    <Text
                        style={[styles.textHeadline, styles.pre, styles.textAlignCenter]}
                        numberOfLines={1}
                    >
                        {currentUserPersonalDetails.displayName ? currentUserPersonalDetails.displayName : formatPhoneNumber(session?.email ?? '')}
                    </Text>
                    {Boolean(currentUserPersonalDetails.displayName) && (
                        <Text
                            style={[styles.textLabelSupporting, styles.mt1, styles.w100, styles.textAlignCenter]}
                            numberOfLines={1}
                        >
                            {formatPhoneNumber(session?.email ?? '')}
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
            testID={InitialSettingsPage.displayName}
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

InitialSettingsPage.displayName = 'InitialSettingsPage';

export default withCurrentUserPersonalDetails(
    withOnyx<InitialSettingsPageProps, InitialSettingsPageOnyxProps>({
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(InitialSettingsPage),
);
