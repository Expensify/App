import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDelegatorErrors, connect, disconnect} from '@libs/actions/Delegate';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {MenuItemProps} from './MenuItem';
import MenuItemList from './MenuItemList';
import type {MenuItemWithLink} from './MenuItemList';
import Popover from './Popover';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function AccountSwitcher() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {canUseNewDotCopilot} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [user] = useOnyx(ONYXKEYS.USER);
    const buttonRef = useRef<HTMLDivElement>(null);

    const [shouldShowDelegatorMenu, setShouldShowDelegatorMenu] = useState(false);
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate ?? false;
    const canSwitchAccounts = canUseNewDotCopilot && (delegators.length > 0 || isActingAsDelegate);

    const createBaseMenuItem = (personalDetails: PersonalDetails | undefined, errors?: Errors, additionalProps: MenuItemWithLink = {}): MenuItemWithLink => {
        const error = Object.values(errors ?? {})[0] ?? '';
        return {
            title: personalDetails?.displayName ?? personalDetails?.login,
            description: Str.removeSMSDomain(personalDetails?.login ?? ''),
            avatarID: personalDetails?.accountID ?? -1,
            icon: personalDetails?.avatar ?? '',
            iconType: CONST.ICON_TYPE_AVATAR,
            outerWrapperStyle: shouldUseNarrowLayout ? {} : styles.accountSwitcherPopover,
            numberOfLinesDescription: 1,
            errorText: error ?? '',
            shouldShowRedDotIndicator: !!error,
            errorTextStyle: styles.mt2,
            ...additionalProps,
        };
    };

    const menuItems = (): MenuItemProps[] => {
        const currentUserMenuItem = createBaseMenuItem(currentUserPersonalDetails, undefined, {
            wrapperStyle: [styles.buttonDefaultBG],
            focused: true,
            shouldShowRightIcon: true,
            iconRight: Expensicons.Checkmark,
            success: true,
            key: `${currentUserPersonalDetails?.login}-current`,
        });

        if (isActingAsDelegate) {
            const delegateEmail = account?.delegatedAccess?.delegate ?? '';

            // Avoid duplicating the current user in the list when switching accounts
            if (delegateEmail === currentUserPersonalDetails.login) {
                return [currentUserMenuItem];
            }

            const delegatePersonalDetails = PersonalDetailsUtils.getPersonalDetailByEmail(delegateEmail);
            const error = ErrorUtils.getLatestErrorField(account?.delegatedAccess, 'connect');

            return [
                createBaseMenuItem(delegatePersonalDetails, error, {
                    onPress: () => {
                        if (isOffline) {
                            Modal.close(() => setShouldShowOfflineModal(true));
                            return;
                        }
                        disconnect();
                    },
                    key: `${delegateEmail}-delegate`,
                }),
                currentUserMenuItem,
            ];
        }

        const delegatorMenuItems: MenuItemProps[] = delegators
            .filter(({email}) => email !== currentUserPersonalDetails.login)
            .map(({email, role, errorFields}, index) => {
                const error = ErrorUtils.getLatestErrorField({errorFields}, 'connect');
                const personalDetails = PersonalDetailsUtils.getPersonalDetailByEmail(email);
                return createBaseMenuItem(personalDetails, error, {
                    badgeText: translate('delegate.role', {role}),
                    onPress: () => {
                        if (isOffline) {
                            Modal.close(() => setShouldShowOfflineModal(true));
                            return;
                        }
                        connect(email);
                    },
                    key: `${email}-${index}`,
                });
            });

        return [currentUserMenuItem, ...delegatorMenuItems];
    };

    return (
        <>
            <PressableWithFeedback
                accessible
                accessibilityLabel={translate('common.profile')}
                onPress={() => {
                    setShouldShowDelegatorMenu(!shouldShowDelegatorMenu);
                }}
                ref={buttonRef}
                interactive={canSwitchAccounts}
                wrapperStyle={[styles.flexGrow1, styles.flex1, styles.mnw0, styles.justifyContentCenter]}
            >
                <View style={[styles.flexRow, styles.gap3]}>
                    <Avatar
                        type={CONST.ICON_TYPE_AVATAR}
                        size={CONST.AVATAR_SIZE.DEFAULT}
                        avatarID={currentUserPersonalDetails?.accountID}
                        source={currentUserPersonalDetails?.avatar}
                        fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    />
                    <View style={[styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter, styles.gap1]}>
                        <View style={[styles.flexRow, styles.gap1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.textBold, styles.textLarge]}
                            >
                                {currentUserPersonalDetails?.displayName}
                            </Text>
                            {canSwitchAccounts && (
                                <View style={styles.justifyContentCenter}>
                                    <Icon
                                        fill={theme.icon}
                                        src={Expensicons.CaretUpDown}
                                        height={variables.iconSizeSmall}
                                        width={variables.iconSizeSmall}
                                    />
                                </View>
                            )}
                        </View>
                        <Text
                            numberOfLines={1}
                            style={[styles.colorMuted, styles.fontSizeLabel]}
                        >
                            {Str.removeSMSDomain(currentUserPersonalDetails?.login ?? '')}
                        </Text>
                        {!!user?.isDebugModeEnabled && (
                            <Text
                                style={[styles.textLabelSupporting, styles.mt1, styles.w100]}
                                numberOfLines={1}
                            >
                                AccountID: {session?.accountID}
                            </Text>
                        )}
                    </View>
                </View>
            </PressableWithFeedback>
            {canSwitchAccounts && (
                <Popover
                    isVisible={shouldShowDelegatorMenu}
                    onClose={() => {
                        setShouldShowDelegatorMenu(false);
                        clearDelegatorErrors();
                    }}
                    anchorRef={buttonRef}
                    anchorPosition={styles.accountSwitcherAnchorPosition}
                >
                    <View style={styles.pb4}>
                        <Text style={[styles.createMenuHeaderText, styles.ph5, styles.pb3, !shouldUseNarrowLayout && styles.pt4]}>{translate('delegate.switchAccount')}</Text>
                        <MenuItemList
                            menuItems={menuItems()}
                            shouldUseSingleExecution
                        />
                    </View>
                </Popover>
            )}
            <ConfirmModal
                title={translate('common.youAppearToBeOffline')}
                isVisible={shouldShowOfflineModal}
                onConfirm={() => setShouldShowOfflineModal(false)}
                onCancel={() => setShouldShowOfflineModal(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('common.offlinePrompt')}
                shouldShowCancelButton={false}
            />
        </>
    );
}

AccountSwitcher.displayName = 'AccountSwitcher';

export default AccountSwitcher;
