import debounce from 'lodash/debounce';
import React, {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {Dimensions, View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearDelegateErrorsByField, removeDelegate} from '@libs/actions/Delegate';
import * as ErrorUtils from '@libs/ErrorUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import type {AnchorPosition} from '@styles/index';
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
    const {windowWidth} = useWindowDimensions();
    const personalDetails = usePersonalDetails();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const delegateButtonRef = useRef<HTMLDivElement | null>(null);

    const [shouldShowDelegatePopoverMenu, setShouldShowDelegatePopoverMenu] = useState(false);
    const [shouldShowRemoveDelegateModal, setShouldShowRemoveDelegateModal] = useState(false);
    const [selectedDelegate, setSelectedDelegate] = useState<Delegate | undefined>();
    const [selectedEmail, setSelectedEmail] = useState<string | undefined>();

    const errorFields = account?.delegatedAccess?.errorFields ?? {};

    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({
        horizontal: 0,
        vertical: 0,
    });

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate || false;
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const delegates = account?.delegatedAccess?.delegates ?? [];
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const hasDelegates = delegates.length > 0;
    const hasDelegators = delegators.length > 0;

    const setMenuPosition = useCallback(() => {
        if (!delegateButtonRef.current) {
            return;
        }

        const position = getClickedTargetLocation(delegateButtonRef.current);
        setAnchorPosition({
            horizontal: position.right - position.left,
            vertical: position.y + position.height,
        });
    }, [delegateButtonRef]);

    const showPopoverMenu = (nativeEvent: GestureResponderEvent | KeyboardEvent, delegate: Delegate) => {
        delegateButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;
        setMenuPosition();
        setShouldShowDelegatePopoverMenu(true);
        setSelectedDelegate(delegate);
        setSelectedEmail(delegate.email);
    };

    const showDelegateNoAccessMenu = () => {
        setIsNoDelegateAccessMenuVisible(true);
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
                action: isActingAsDelegate ? showDelegateNoAccessMenu : waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute())),
            },
            {
                translationKey: 'closeAccountPage.closeAccount',
                icon: Expensicons.ClosedSign,
                action: isActingAsDelegate ? showDelegateNoAccessMenu : waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CLOSE)),
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
    }, [translate, waitForNavigate, styles, isActingAsDelegate]);

    const delegateMenuItems: MenuItemProps[] = useMemo(
        () =>
            delegates
                .filter((d) => !d.optimisticAccountID)
                .map(({email, role, pendingAction, pendingFields}) => {
                    const personalDetail = getPersonalDetailByEmail(email);
                    const addDelegateErrors = errorFields?.addDelegate?.[email];
                    const error = ErrorUtils.getLatestError(addDelegateErrors);

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

                        Navigation.navigate(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(email, role, true));
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
                        onPendingActionDismiss: () => clearDelegateErrorsByField(email, 'addDelegate'),
                        error,
                        onPress,
                        success: selectedEmail === email,
                    };
                }),
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [delegates, translate, styles, personalDetails, errorFields, windowWidth, selectedEmail],
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [delegators, styles, translate, personalDetails],
    );

    const delegatePopoverMenuItems: PopoverMenuItem[] = [
        {
            text: translate('delegate.changeAccessLevel'),
            icon: Expensicons.Pencil,
            onPress: () => {
                if (isActingAsDelegate) {
                    Modal.close(() => setIsNoDelegateAccessMenuVisible(true));
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(selectedDelegate?.email ?? '', selectedDelegate?.role ?? ''));
                setShouldShowDelegatePopoverMenu(false);
                setSelectedDelegate(undefined);
                setSelectedEmail(undefined);
            },
        },
        {
            text: translate('delegate.removeCopilot'),
            icon: Expensicons.Trashcan,
            onPress: () => {
                if (isActingAsDelegate) {
                    Modal.close(() => setIsNoDelegateAccessMenuVisible(true));
                    return;
                }
                Modal.close(() => {
                    setShouldShowDelegatePopoverMenu(false);
                    setShouldShowRemoveDelegateModal(true);
                    setSelectedEmail(undefined);
                });
            },
        },
    ];

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
                            <PopoverMenu
                                isVisible={shouldShowDelegatePopoverMenu}
                                anchorRef={delegateButtonRef as RefObject<View>}
                                anchorPosition={{
                                    horizontal: anchorPosition.horizontal,
                                    vertical: anchorPosition.vertical,
                                }}
                                anchorAlignment={{
                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                }}
                                menuItems={delegatePopoverMenuItems}
                                onClose={() => {
                                    setShouldShowDelegatePopoverMenu(false);
                                    setSelectedEmail(undefined);
                                }}
                            />
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
                    <DelegateNoAccessModal
                        isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                        onClose={() => setIsNoDelegateAccessMenuVisible(false)}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default SecuritySettingsPage;
