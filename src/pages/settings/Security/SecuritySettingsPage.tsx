import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import Popover from '@components/Popover';
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
import useWindowDimensions from '@hooks/useWindowDimensions';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
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
    const {windowWidth} = useWindowDimensions();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const delegateButtonRef = useRef<HTMLDivElement | null>(null);

    const [shouldShowDelegateMenu, setShouldShowDelegateMenu] = useState(false);
    const [shouldShowRemoveDelegateModal, setShouldShowRemoveDelegateModal] = useState(false);

    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    });

    const setMenuPosition = useCallback(() => {
        if (!delegateButtonRef.current) {
            return;
        }

        const position = getClickedTargetLocation(delegateButtonRef.current);

        setAnchorPosition({
            anchorPositionTop: position.top + position.height - variables.bankAccountActionPopoverTopSpacing,
            // We want the position to be 23px to the right of the left border
            anchorPositionRight: windowWidth - position.right + variables.bankAccountActionPopoverRightSpacing,
            anchorPositionHorizontal: position.x + variables.addBankAccountLeftSpacing,
            anchorPositionVertical: position.y,
        });
    }, [windowWidth]);

    const delegates = account?.delegatedAccess?.delegates ?? [];
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const hasDelegates = delegates.length > 0;
    const hasDelegators = delegators.length > 0;

    const showPopoverMenu = (nativeEvent?: GestureResponderEvent | KeyboardEvent) => {
        console.log('showPopoverMenu', nativeEvent);
        delegateButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;
    };

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
            onPress: showPopoverMenu,
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
                            <MenuItem
                                title={translate('delegate.addCopilot')}
                                icon={Expensicons.UserPlus}
                                iconFill={theme.iconSuccessFill}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_ADD_DELEGATE)}
                                shouldShowRightIcon
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mb6]}
                            />
                            {hasDelegators && (
                                <>
                                    <Text style={[styles.textLabelSupporting, styles.pv1]}>{translate('delegate.youCanAccessTheseAccounts')}</Text>
                                    <MenuItemList menuItems={delegatorMenuItems} />
                                </>
                            )}
                            <Popover
                                isVisible={shouldShowDelegateMenu}
                                anchorRef={delegateButtonRef as RefObject<View>}
                                onClose={() => setShouldShowDelegateMenu(false)}
                            >
                                <ConfirmModal
                                    isVisible={shouldShowRemoveDelegateModal}
                                    title={translate('delegate.removeCopilot')}
                                    prompt={translate('delegate.removeCopilotConfirmation')}
                                    onConfirm={() => {}}
                                    onCancel={() => {}}
                                    confirmText={translate('delegate.removeCopilot')}
                                    cancelText={translate('common.cancel')}
                                    shouldShowCancelButton
                                />
                            </Popover>
                        </Section>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default SecuritySettingsPage;
