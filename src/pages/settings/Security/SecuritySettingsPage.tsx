import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {openSecuritySettingsPage} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import {hasDeviceManagementError} from '@libs/UserUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import useSecuritySettingsSectionIllustration from './useSecuritySettingsSectionIllustration';

type BaseMenuItemType = WithSentryLabel & {
    translationKey: TranslationPaths;
    icon: IconAsset;
    iconRight?: IconAsset;
    action: () => Promise<void> | void;
    link?: string;
    wrapperStyle?: StyleProp<ViewStyle>;
    brickRoadIndicator?: MenuItemProps['brickRoadIndicator'];
};

function SecuritySettingsPage() {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowCollapse', 'ClosedSign', 'Fingerprint', 'Monitor', 'Shield', 'UserLock']);
    const illustrations = useMemoizedLazyIllustrations(['LockClosed']);
    const securitySettingsIllustration = useSecuritySettingsSectionIllustration();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useDocumentTitle(translate('initialSettingsPage.security'));
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [hasDeviceManagementErrorValue] = useOnyx(ONYXKEYS.LOGINS, {selector: hasDeviceManagementError});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const privateSubscription = usePrivateSubscription();
    const isUserValidated = account?.validated;

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const hasEverRegisteredForMultifactorAuthentication = account?.multifactorAuthenticationPublicKeyIDs !== CONST.MULTIFACTOR_AUTHENTICATION.PUBLIC_KEYS_AUTHENTICATION_NEVER_REGISTERED;

    useEffect(() => {
        openSecuritySettingsPage();
    }, []);

    const securityMenuItems = useMemo(() => {
        const baseMenuItems: BaseMenuItemType[] = [
            {
                translationKey: 'twoFactorAuth.headerTitle',
                icon: icons.Shield,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.TWO_FACTOR_AUTH,
                action: () => {
                    if (isActingAsDelegate) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    if (isAccountLocked) {
                        showLockedAccountModal();
                        return;
                    }
                    if (!isUserValidated) {
                        Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute());
                        return;
                    }
                    Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute());
                },
            },
        ];

        if (hasEverRegisteredForMultifactorAuthentication) {
            baseMenuItems.push({
                translationKey: 'multifactorAuthentication.revoke.title',
                icon: icons.Fingerprint,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.REVOKE_MFA,
                action: () => {
                    Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_REVOKE);
                },
            });
        }

        baseMenuItems.push({
            translationKey: 'mergeAccountsPage.mergeAccount',
            icon: icons.ArrowCollapse,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.MERGE_ACCOUNTS,
            action: () => {
                if (isAccountLocked) {
                    showLockedAccountModal();
                    return;
                }
                if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.INVOICING) {
                    Navigation.navigate(
                        ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(currentUserPersonalDetails.login ?? '', CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING, ROUTES.SETTINGS_SECURITY),
                    );
                    return;
                }

                Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS.route);
            },
        });

        if (isAccountLocked) {
            baseMenuItems.push({
                translationKey: 'lockAccountPage.unlockAccount',
                icon: icons.UserLock,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.LOCK_UNLOCK_ACCOUNT,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_UNLOCK_ACCOUNT)),
            });
        } else {
            baseMenuItems.push({
                translationKey: 'lockAccountPage.reportSuspiciousActivity',
                icon: icons.UserLock,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.LOCK_UNLOCK_ACCOUNT,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_LOCK_ACCOUNT)),
            });
        }

        const deviceManagementBrickRoadIndicator = hasDeviceManagementErrorValue ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
        baseMenuItems.push({
            translationKey: 'deviceManagementPage.title',
            icon: icons.Monitor,
            brickRoadIndicator: deviceManagementBrickRoadIndicator,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.DEVICE_MANAGEMENT,
            action: () => Navigation.navigate(ROUTES.SETTINGS_DEVICE_MANAGEMENT),
        });

        baseMenuItems.push({
            translationKey: 'closeAccountPage.closeAccount',
            icon: icons.ClosedSign,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.CLOSE_ACCOUNT,
            action: () => {
                if (isAccountLocked) {
                    showLockedAccountModal();
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_CLOSE);
            },
        });
        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            onPress: item.action,
            shouldShowRightIcon: true,
            link: '',
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            sentryLabel: item.sentryLabel,
            brickRoadIndicator: item.brickRoadIndicator,
        }));
    }, [
        icons.ArrowCollapse,
        icons.ClosedSign,
        icons.UserLock,
        icons.Shield,
        icons.Fingerprint,
        icons.Monitor,
        isAccountLocked,
        isActingAsDelegate,
        isUserValidated,
        showDelegateNoAccessModal,
        showLockedAccountModal,
        privateSubscription?.type,
        currentUserPersonalDetails.login,
        waitForNavigate,
        translate,
        styles.sectionMenuItemTopDescription,
        hasEverRegisteredForMultifactorAuthentication,
        hasDeviceManagementErrorValue,
    ]);

    return (
        <ScreenWrapper
            testID="SecuritySettingsPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.security')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={Navigation.goBack}
                icon={illustrations.LockClosed}
                shouldUseHeadlineHeader
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('securityPage.title')}
                        subtitle={translate('securityPage.subtitle')}
                        isCentralPane
                        subtitleMuted
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.ice500}
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                        {...securitySettingsIllustration}
                    >
                        <MenuItemList
                            menuItems={securityMenuItems}
                            shouldUseSingleExecution
                        />
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default SecuritySettingsPage;
