import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SecuritySettingsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const {canUseNewDotCopilot} = usePermissions();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate ?? false;

    const delegates = account?.delegatedAccess?.delegates ?? [];
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const hasDelegates = delegates.length > 0;
    const hasDelegators = delegators.length > 0;

    const securityMenuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'twoFactorAuth.headerTitle',
                icon: Expensicons.Shield,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute())),
            },
            {
                translationKey: 'closeAccountPage.closeAccount',
                icon: Expensicons.ClosedSign,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CLOSE)),
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey as TranslationPaths),
            icon: item.icon,
            onPress: item.action,
            shouldShowRightIcon: true,
            link: '',
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [translate, waitForNavigate, styles]);

    const delegateMenuItems: MenuItemProps[] = delegates.map(({email, role}) => {
        const personalDetail = getPersonalDetailByEmail(email);

        return {
            title: personalDetail?.displayName ?? email,
            description: personalDetail?.displayName ? email : '',
            badgeText: translate('delegate.role', role),
            avatarID: personalDetail?.accountID ?? -1,
            icon: personalDetail?.avatar ?? '',
            iconType: CONST.ICON_TYPE_AVATAR,
            numberOfLinesDescription: 1,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            iconRight: Expensicons.ThreeDots,
            shouldShowRightIcon: true,
        };
    });

    const delegatorMenuItems: MenuItemProps[] = delegators.map(({email, role}) => {
        const personalDetail = getPersonalDetailByEmail(email);

        return {
            title: personalDetail?.displayName ?? email,
            description: personalDetail?.displayName ? email : '',
            badgeText: translate('delegate.role', role),
            avatarID: personalDetail?.accountID ?? -1,
            icon: personalDetail?.avatar ?? '',
            iconType: CONST.ICON_TYPE_AVATAR,
            numberOfLinesDescription: 1,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            interactive: false,
        };
    });

    return (
        <ScreenWrapper
            testID={SecuritySettingsPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.security')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => Navigation.goBack()}
                icon={Illustrations.LockClosed}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('securityPage.title')}
                        subtitle={translate('securityPage.subtitle')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.Safe}
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                    >
                        <MenuItemList
                            menuItems={securityMenuItems}
                            shouldUseSingleExecution
                        />
                    </Section>
                    {canUseNewDotCopilot && (
                        <View style={styles.mb5}>
                            <Section
                                title={translate('delegate.copilotDelegatedAccess')}
                                subtitle={translate('delegate.copilotDelegatedAccessDescription')}
                                isCentralPane
                                subtitleMuted
                                titleStyles={styles.accountSettingsSectionTitle}
                                childrenStyles={styles.pt5}
                            >
                                {hasDelegates && (
                                    <>
                                        <Text style={[styles.textLabelSupporting, styles.pv1]}>{translate('delegate.membersCanAccessYourAccount')}</Text>
                                        <MenuItemList menuItems={delegateMenuItems} />
                                    </>
                                )}
                                {!isActingAsDelegate && (
                                    <MenuItem
                                        title={translate('delegate.addCopilot')}
                                        icon={Expensicons.UserPlus}
                                        iconFill={theme.iconSuccessFill}
                                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_ADD_DELEGATE)}
                                        shouldShowRightIcon
                                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mb6]}
                                    />
                                )}
                                {hasDelegators && (
                                    <>
                                        <Text style={[styles.textLabelSupporting, styles.pv1]}>{translate('delegate.youCanAccessTheseAccounts')}</Text>
                                        <MenuItemList menuItems={delegatorMenuItems} />
                                    </>
                                )}
                            </Section>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default SecuritySettingsPage;
