import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {Dimensions, View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useConfirmModal from '@hooks/useConfirmModal';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSwitchToDelegator from '@hooks/useSwitchToDelegator';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDelegateErrorsByField, clearDelegatorErrors, openSecuritySettingsPage, removeDelegate} from '@libs/actions/Delegate';
import {getLatestError} from '@libs/ErrorUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import Navigation from '@libs/Navigation/Navigation';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {useIsAgentAccount} from '@libs/SessionUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import type {AnchorPosition} from '@styles/index';
import colors from '@styles/theme/colors';
import {close as modalClose} from '@userActions/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Account from '@src/types/onyx/Account';
import type {Delegate, DelegateRole} from '@src/types/onyx/Account';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const accountDelegationSelector = (accountValue: Account | undefined) => ({
    delegatedAccess: accountValue?.delegatedAccess,
    validated: accountValue?.validated,
});

function CopilotPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'ThreeDots', 'Trashcan', 'UserPlus']);
    const illustrations = useMemoizedLazyIllustrations(['Copilots', 'Members']);
    const styles = useThemeStyles();
    const {localeCompare, translate, formatPhoneNumber} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useDocumentTitle(translate('delegate.copilot'));
    const personalDetailsByLogin = usePersonalDetailsByLogin();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountDelegationSelector});
    const isAgentAccount = useIsAgentAccount();
    const actingDelegateEmail = account?.delegatedAccess?.delegate?.toLowerCase();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isUserValidated = account?.validated;
    const delegateButtonRef = useRef<HTMLDivElement | null>(null);
    const switchToDelegator = useSwitchToDelegator();

    const [shouldShowDelegatePopoverMenu, setShouldShowDelegatePopoverMenu] = useState(false);
    const [selectedDelegate, setSelectedDelegate] = useState<Delegate | undefined>();
    const [selectedEmail, setSelectedEmail] = useState<string | undefined>();

    const {showConfirmModal} = useConfirmModal();
    const showRemoveCopilotModal = useCallback(() => {
        return showConfirmModal({
            title: translate('delegate.removeCopilot'),
            prompt: translate('delegate.removeCopilotConfirmation'),
            confirmText: translate('delegate.removeCopilot'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        });
    }, [showConfirmModal, translate]);

    const errorFields = account?.delegatedAccess?.errorFields ?? {};

    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({
        horizontal: 0,
        vertical: 0,
    });

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const delegates = account?.delegatedAccess?.delegates ?? [];
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const hasDelegators = delegators.length > 0;
    const hasDelegates = delegates.length > 0;

    const setMenuPosition = useCallback(() => {
        if (!delegateButtonRef.current) {
            return;
        }

        const position = getClickedTargetLocation(delegateButtonRef.current);
        setAnchorPosition({
            horizontal: position.right,
            vertical: position.y + position.height,
        });
    }, [delegateButtonRef]);

    const showPopoverMenu = useCallback(
        (nativeEvent: GestureResponderEvent | KeyboardEvent, delegate: Delegate) => {
            delegateButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;
            setMenuPosition();
            setShouldShowDelegatePopoverMenu(true);
            setSelectedDelegate(delegate);
            setSelectedEmail(delegate.email);
        },
        [setMenuPosition],
    );

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

    const renderTitleWithRole = useCallback(
        (titleText: string, descriptionText: string, role: DelegateRole | undefined) => (
            <View style={[styles.flexShrink1, styles.ml3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexShrink1]}>
                    <Text
                        style={[styles.textStrong, styles.flexShrink1]}
                        numberOfLines={1}
                    >
                        {titleText}
                    </Text>
                    {!!role && (
                        <Badge
                            text={translate('delegate.role', {role})}
                            isCondensed
                            badgeStyles={[styles.copilotRoleBadge, styles.flexShrink0]}
                        />
                    )}
                </View>
                {!!descriptionText && (
                    <Text
                        style={[styles.textLabelSupporting, styles.mt1]}
                        numberOfLines={1}
                    >
                        {descriptionText}
                    </Text>
                )}
            </View>
        ),
        [styles, translate],
    );

    const delegateMenuItems: MenuItemProps[] = useMemo(() => {
        const sortedDelegates = sortAlphabetically(
            delegates.filter((d) => !d.optimisticAccountID).map((d) => ({...d, sortKey: personalDetailsByLogin[d.email.toLowerCase()]?.displayName ?? formatPhoneNumber(d.email)})),
            'sortKey',
            localeCompare,
        );
        return sortedDelegates.map(({email, role, pendingAction, pendingFields}) => {
            const personalDetail = personalDetailsByLogin[email.toLowerCase()];
            const addDelegateErrors = errorFields?.addDelegate?.[email];
            const error = getLatestError(addDelegateErrors);
            const isOwnerRow = isAgentAccount && !!actingDelegateEmail && email.toLowerCase() === actingDelegateEmail;

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

                Navigation.navigate(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(email, role));
            };

            const formattedEmail = formatPhoneNumber(email);
            const titleText = personalDetail?.displayName ?? formattedEmail;
            const descriptionText = personalDetail?.displayName ? formattedEmail : '';
            return {
                key: email,
                titleComponent: renderTitleWithRole(titleText, descriptionText, role),
                avatarID: personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                icon: personalDetail?.avatar ?? (personalDetail ? getDefaultAvatarURL({accountID: personalDetail.accountID, accountEmail: email}) : undefined),
                iconType: CONST.ICON_TYPE_AVATAR,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                iconRight: isOwnerRow ? undefined : icons.ThreeDots,
                shouldShowRightIcon: !isOwnerRow,
                pendingAction,
                shouldForceOpacity: !!pendingAction,
                onPendingActionDismiss: () => clearDelegateErrorsByField({email, fieldName: 'addDelegate', delegatedAccess: account?.delegatedAccess}),
                error,
                onPress: isOwnerRow ? undefined : onPress,
                interactive: !isOwnerRow,
                success: selectedEmail === email,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.DELEGATE_ITEM,
            };
        });
    }, [
        delegates,
        errorFields,
        account?.delegatedAccess,
        formatPhoneNumber,
        personalDetailsByLogin,
        styles,
        selectedEmail,
        icons.ThreeDots,
        localeCompare,
        showPopoverMenu,
        renderTitleWithRole,
        isAgentAccount,
        actingDelegateEmail,
    ]);

    const delegatorMenuItems: MenuItemProps[] = useMemo(() => {
        const sortedDelegators = sortAlphabetically(
            delegators.map((d) => ({...d, sortKey: personalDetailsByLogin[d.email.toLowerCase()]?.displayName ?? formatPhoneNumber(d.email)})),
            'sortKey',
            localeCompare,
        );
        return sortedDelegators.map(({email, role, pendingAction}) => {
            const personalDetail = personalDetailsByLogin[email.toLowerCase()];
            const formattedEmail = formatPhoneNumber(email);
            const connectError = getLatestError(errorFields?.connect?.[email]);
            const isCurrentUser = email === session?.email;
            const isPending = !!pendingAction;
            const titleText = personalDetail?.displayName ?? formattedEmail;
            const descriptionText = personalDetail?.displayName ? formattedEmail : '';

            return {
                key: email,
                titleComponent: renderTitleWithRole(titleText, descriptionText, role),
                avatarID: personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                icon: personalDetail?.avatar ?? (personalDetail ? getDefaultAvatarURL({accountID: personalDetail.accountID, accountEmail: email}) : undefined),
                iconType: CONST.ICON_TYPE_AVATAR,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                disabled: isPending || isCurrentUser,
                onPress: () => switchToDelegator(email),
                role: CONST.ROLE.LINK,
                error: connectError,
                onPendingActionDismiss: () => clearDelegatorErrors({delegatedAccess: account?.delegatedAccess}),
                shouldShowRightComponent: true,
                rightComponent: (
                    <View style={[styles.ml2, styles.alignSelfCenter]}>
                        <Button
                            small
                            success
                            text={translate('delegate.switch')}
                            isDisabled={isPending || isCurrentUser}
                            onPress={() => switchToDelegator(email)}
                            sentryLabel={CONST.SENTRY_LABEL.ACCOUNT_SWITCHER.SHOW_ACCOUNTS}
                        />
                    </View>
                ),
            };
        });
    }, [
        delegators,
        styles,
        translate,
        formatPhoneNumber,
        account?.delegatedAccess,
        personalDetailsByLogin,
        localeCompare,
        session?.email,
        errorFields,
        switchToDelegator,
        renderTitleWithRole,
    ]);

    const delegatePopoverMenuItems: PopoverMenuItem[] = [
        {
            text: translate('delegate.changeAccessLevel'),
            icon: icons.Pencil,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.DELEGATE_CHANGE_ACCESS,
            onPress: () => {
                if (isActingAsDelegate) {
                    modalClose(() => showDelegateNoAccessModal());
                    return;
                }
                if (isAccountLocked) {
                    modalClose(() => showLockedAccountModal());
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
            icon: icons.Trashcan,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SECURITY.DELEGATE_REMOVE,
            onPress: () => {
                if (selectedDelegate?.email !== account?.delegatedAccess?.delegate && isActingAsDelegate) {
                    modalClose(() => showDelegateNoAccessModal());
                    return;
                }
                if (isAccountLocked) {
                    modalClose(() => showLockedAccountModal());
                    return;
                }
                modalClose(() => {
                    setShouldShowDelegatePopoverMenu(false);
                    setSelectedEmail(undefined);
                    showRemoveCopilotModal().then((result) => {
                        if (result.action === ModalActions.CLOSE) {
                            setSelectedDelegate(undefined);
                        } else {
                            if (selectedDelegate?.email !== account?.delegatedAccess?.delegate && isActingAsDelegate) {
                                showDelegateNoAccessModal();
                                return;
                            }
                            removeDelegate({email: selectedDelegate?.email ?? '', delegatedAccess: account?.delegatedAccess});
                            setSelectedDelegate(undefined);
                        }
                    });
                });
            },
        },
    ];

    useEffect(() => {
        openSecuritySettingsPage();
    }, []);

    return (
        <ScreenWrapper
            testID="CopilotPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('delegate.copilot')}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={Navigation.goBack}
                        icon={illustrations.Members}
                        shouldUseHeadlineHeader
                        shouldDisplaySearchRouter
                        shouldDisplayHelpButton
                    />
                    <ScrollView contentContainerStyle={styles.pt3}>
                        <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, safeAreaPaddingBottomStyle]}>
                            <Section
                                title={translate('delegate.copilotDelegatedAccess')}
                                renderSubtitle={() => (
                                    <Text style={[styles.textNormal, styles.colorMuted, styles.mt2]}>
                                        {translate('delegate.copilotDelegatedAccessDescription')}{' '}
                                        <TextLink
                                            href={CONST.COPILOT_HELP_URL}
                                            accessibilityLabel={translate('delegate.learnMoreAboutDelegatedAccess')}
                                        >
                                            {translate('common.learnMore')}
                                        </TextLink>
                                        .
                                    </Text>
                                )}
                                isCentralPane
                                subtitleMuted
                                illustration={illustrations.Copilots}
                                illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                                illustrationStyle={styles.copilotsIllustration}
                                illustrationBackgroundColor={colors.blue700}
                                titleStyles={styles.accountSettingsSectionTitle}
                                childrenStyles={styles.pt5}
                            >
                                {hasDelegators && (
                                    <>
                                        <Text style={[styles.textLabelSupporting, styles.pv1]}>{translate('delegate.youCanAccessTheseAccounts')}</Text>
                                        <MenuItemList menuItems={delegatorMenuItems} />
                                    </>
                                )}
                                {hasDelegates && (
                                    <>
                                        <Text style={[styles.textLabelSupporting, styles.pv1, hasDelegators && styles.mt5]}>{translate('delegate.membersCanAccessYourAccount')}</Text>
                                        <MenuItemList menuItems={delegateMenuItems} />
                                    </>
                                )}
                                {!isAgentAccount ? (
                                    <MenuItem
                                        title={translate('delegate.addCopilot')}
                                        icon={icons.UserPlus}
                                        sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SECURITY.ADD_COPILOT}
                                        onPress={() => {
                                            if (isActingAsDelegate) {
                                                modalClose(() => showDelegateNoAccessModal());
                                                return;
                                            }
                                            if (!isUserValidated) {
                                                Navigation.navigate(ROUTES.SETTINGS_DELEGATE_VERIFY_ACCOUNT);
                                                return;
                                            }
                                            if (isAccountLocked) {
                                                showLockedAccountModal();
                                                return;
                                            }
                                            Navigation.navigate(ROUTES.SETTINGS_ADD_DELEGATE);
                                        }}
                                        shouldShowRightIcon
                                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                    />
                                ) : null}
                            </Section>
                            <PopoverMenu
                                isVisible={shouldShowDelegatePopoverMenu}
                                anchorRef={delegateButtonRef as RefObject<View | null>}
                                anchorPosition={anchorPosition}
                                anchorAlignment={{
                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                }}
                                menuItems={delegatePopoverMenuItems}
                                onClose={() => {
                                    setShouldShowDelegatePopoverMenu(false);
                                    setSelectedEmail(undefined);
                                }}
                            />
                        </View>
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

export default CopilotPage;
