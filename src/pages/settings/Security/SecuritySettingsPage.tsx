import debounce from 'lodash/debounce';
import React, {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {Dimensions, View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import Popover from '@components/Popover';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearAddDelegateErrors, removeDelegate} from '@libs/actions/Delegate';
import * as ErrorUtils from '@libs/ErrorUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Delegate} from '@src/types/onyx/Account';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function SecuritySettingsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {canUseNewDotCopilot} = usePermissions();
    const {windowWidth} = useWindowDimensions();
    const personalDetails = usePersonalDetails();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const delegateButtonRef = useRef<HTMLDivElement | null>(null);

    const [shouldShowDelegatePopoverMenu, setShouldShowDelegatePopoverMenu] = useState(false);
    const [shouldShowRemoveDelegateModal, setShouldShowRemoveDelegateModal] = useState(false);
    const [selectedDelegate, setSelectedDelegate] = useState<Delegate | undefined>();

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
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate || false;

    const delegates = account?.delegatedAccess?.delegates ?? [];
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const hasDelegates = delegates.length > 0;
    const hasDelegators = delegators.length > 0;

    const showPopoverMenu = (nativeEvent: GestureResponderEvent | KeyboardEvent, delegate: Delegate) => {
        delegateButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;
        setMenuPosition();
        setShouldShowDelegatePopoverMenu(true);
        setSelectedDelegate(delegate);
    };

    useLayoutEffect(() => {
        const popoverPositionListener = Dimensions.addEventListener('change', () => {
            debounce(setMenuPosition, CONST.TIMING.RESIZE_DEBOUNCE_TIME)();
        });

        return () => {
            if (!popoverPositionListener) {
                return;
            }
            popoverPositionListener.remove();
        };
    }, [setMenuPosition]);

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

    const delegateMenuItems: MenuItemProps[] = useMemo(
        () =>
            delegates
                .filter((d) => !d.optimisticAccountID)
                .map(({email, role, pendingAction, errorFields, pendingFields}) => {
                    const personalDetail = getPersonalDetailByEmail(email);
                    const error = ErrorUtils.getLatestErrorField({errorFields}, 'addDelegate');

                    const onPress = (e: GestureResponderEvent | KeyboardEvent) => {
                        if (isEmptyObject(pendingAction)) {
                            showPopoverMenu(e, {email, role});
                            return;
                        }
                        if (!role) {
                            Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(email));
                            return;
                        }
                        if (pendingFields?.role && !pendingFields?.email) {
                            Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(email, role));
                            return;
                        }
                    };

                    const formattedEmail = formatPhoneNumber(email);
                    return {
                        title: personalDetail?.displayName ?? formattedEmail,
                        description: personalDetail?.displayName ? formattedEmail : '',
                        badgeText: translate('delegate.role', {role}),
                        avatarID: personalDetail?.accountID ?? -1,
                        icon: personalDetail?.avatar ?? FallbackAvatar,
                        iconType: CONST.ICON_TYPE_AVATAR,
                        numberOfLinesDescription: 1,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        iconRight: Expensicons.ThreeDots,
                        shouldShowRightIcon: true,
                        pendingAction,
                        shouldForceOpacity: !!pendingAction,
                        onPendingActionDismiss: () => clearAddDelegateErrors(email, 'addDelegate'),
                        error,
                        onPress,
                    };
                }),
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [delegates, translate, styles, personalDetails],
    );

    const delegatorMenuItems: MenuItemProps[] = useMemo(
        () =>
            delegators.map(({email, role}) => {
                const personalDetail = getPersonalDetailByEmail(email);
                const formattedEmail = formatPhoneNumber(email);

                return {
                    title: personalDetail?.displayName ?? formattedEmail,
                    description: personalDetail?.displayName ? formattedEmail : '',
                    badgeText: translate('delegate.role', {role}),
                    avatarID: personalDetail?.accountID ?? -1,
                    icon: personalDetail?.avatar ?? FallbackAvatar,
                    iconType: CONST.ICON_TYPE_AVATAR,
                    numberOfLinesDescription: 1,
                    wrapperStyle: [styles.sectionMenuItemTopDescription],
                    interactive: false,
                };
            }),
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [delegators, styles, translate, personalDetails],
    );

    return (
        <ScreenWrapper
            testID={SecuritySettingsPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('initialSettingsPage.security')}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={() => Navigation.goBack()}
                        icon={Illustrations.LockClosed}
                        shouldDisplaySearchRouter
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
                                <View style={safeAreaPaddingBottomStyle}>
                                    <Section
                                        title={translate('delegate.copilotDelegatedAccess')}
                                        renderSubtitle={() => (
                                            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('delegate.copilotDelegatedAccessDescription')} </Text>
                                                <TextLink
                                                    style={[styles.link]}
                                                    href={CONST.COPILOT_HELP_URL}
                                                >
                                                    {translate('common.learnMore')}
                                                </TextLink>
                                            </Text>
                                        )}
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
                            <Popover
                                isVisible={shouldShowDelegatePopoverMenu}
                                anchorRef={delegateButtonRef as RefObject<View>}
                                anchorPosition={{
                                    top: anchorPosition.anchorPositionTop,
                                    right: anchorPosition.anchorPositionRight,
                                }}
                                onClose={() => {
                                    setShouldShowDelegatePopoverMenu(false);
                                }}
                            >
                                <View style={[styles.mv5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}>
                                    <MenuItem
                                        title={translate('delegate.changeAccessLevel')}
                                        icon={Expensicons.Pencil}
                                        onPress={() => {
                                            Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(selectedDelegate?.email ?? '', selectedDelegate?.role ?? ''));
                                            setShouldShowDelegatePopoverMenu(false);
                                            setSelectedDelegate(undefined);
                                        }}
                                        wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                                    />
                                    <MenuItem
                                        title={translate('delegate.removeCopilot')}
                                        icon={Expensicons.Trashcan}
                                        onPress={() =>
                                            Modal.close(() => {
                                                setShouldShowDelegatePopoverMenu(false);
                                                setShouldShowRemoveDelegateModal(true);
                                            })
                                        }
                                        wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                                    />
                                </View>
                            </Popover>
                            <ConfirmModal
                                isVisible={shouldShowRemoveDelegateModal}
                                title={translate('delegate.removeCopilot')}
                                prompt={translate('delegate.removeCopilotConfirmation')}
                                danger
                                onConfirm={() => {
                                    removeDelegate(selectedDelegate?.email ?? '');
                                    setShouldShowRemoveDelegateModal(false);
                                    setSelectedDelegate(undefined);
                                }}
                                onCancel={() => {
                                    setShouldShowRemoveDelegateModal(false);
                                    setSelectedDelegate(undefined);
                                }}
                                confirmText={translate('delegate.removeCopilot')}
                                cancelText={translate('common.cancel')}
                                shouldShowCancelButton
                            />
                        </View>
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default SecuritySettingsPage;
