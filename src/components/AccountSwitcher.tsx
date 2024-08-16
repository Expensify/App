import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDelegatorErrors, connect, disconnect} from '@libs/actions/Delegate';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Avatar from './Avatar';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {MenuItemProps} from './MenuItem';
import MenuItemList from './MenuItemList';
import Popover from './Popover';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function AccountSwitcher() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const avatarUrl = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? -1;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {canUseNewDotCopilot} = usePermissions();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [shouldShowDelegatorMenu, setShouldShowDelegatorMenu] = useState(false);

    const delegators = useMemo(() => {
        return account?.delegatedAccess?.delegators ?? [];
    }, [account?.delegatedAccess?.delegators]);

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate ?? false;
    const canSwitchAccounts = canUseNewDotCopilot && (delegators.length > 0 || isActingAsDelegate);

    const menuItems: MenuItemProps[] = useMemo(() => {
        if (isActingAsDelegate) {
            const delegateEmail = account?.delegatedAccess?.delegate ?? '';
            const personalDetail = PersonalDetailsUtils.getPersonalDetailByEmail(delegateEmail);
            const error = account?.delegatedAccess?.error;

            // Show original account and the account we are acting as
            return [
                {
                    title: personalDetail?.displayName,
                    description: delegateEmail,
                    onPress: () => {
                        disconnect();
                    },
                    avatarID: personalDetail?.accountID ?? -1,
                    icon: personalDetail?.avatar ?? '',
                    iconType: CONST.ICON_TYPE_AVATAR,
                    outerWrapperStyle: isSmallScreenWidth ? {} : styles.accountSwitcherPopover,
                    numberOfLinesDescription: 1,
                    errorText: error ? translate(error) : '',
                    shouldShowRedDotIndicator: !!error,
                    errorTextStyle: styles.mt2,
                },
                {
                    title: currentUserPersonalDetails?.displayName ?? currentUserPersonalDetails?.login,
                    description: currentUserPersonalDetails?.displayName ? currentUserPersonalDetails?.login : '',
                    iconRight: Expensicons.Checkmark,
                    shouldShowRightIcon: true,
                    success: true,
                    avatarID: currentUserPersonalDetails?.accountID ?? -1,
                    icon: avatarUrl,
                    iconType: CONST.ICON_TYPE_AVATAR,
                    outerWrapperStyle: isSmallScreenWidth ? {} : styles.accountSwitcherPopover,
                    numberOfLinesDescription: 1,
                    wrapperStyle: [styles.buttonDefaultBG],
                    focused: true,
                },
            ];
        }

        const delegatorMenuItems: MenuItemProps[] = delegators.map(({email, role, error}) => {
            const personalDetail = PersonalDetailsUtils.getPersonalDetailByEmail(email);
            return {
                title: personalDetail?.displayName ?? email,
                description: personalDetail?.displayName ? email : '',
                badgeText: translate('delegate.role', role),
                onPress: () => {
                    connect(email);
                },
                avatarID: personalDetail?.accountID ?? -1,
                icon: personalDetail?.avatar ?? '',
                iconType: CONST.ICON_TYPE_AVATAR,
                outerWrapperStyle: isSmallScreenWidth ? {} : styles.accountSwitcherPopover,
                numberOfLinesDescription: 1,
                errorText: error ? translate(error) : '',
                shouldShowRedDotIndicator: !!error,
                errorTextStyle: styles.mt2,
            };
        });

        const delegatorMenuItemsWithCurrentUser: MenuItemProps[] = [
            {
                title: currentUserPersonalDetails?.displayName ?? currentUserPersonalDetails?.login,
                description: currentUserPersonalDetails?.displayName ? currentUserPersonalDetails?.login : '',
                iconRight: Expensicons.Checkmark,
                shouldShowRightIcon: true,
                success: true,
                avatarID: currentUserPersonalDetails?.accountID ?? -1,
                icon: avatarUrl,
                iconType: CONST.ICON_TYPE_AVATAR,
                outerWrapperStyle: isSmallScreenWidth ? {} : styles.accountSwitcherPopover,
                numberOfLinesDescription: 1,
                wrapperStyle: [styles.buttonDefaultBG],
                focused: true,
            },
            ...delegatorMenuItems,
        ];
        return delegatorMenuItemsWithCurrentUser;
    }, [
        account?.delegatedAccess?.delegate,
        avatarUrl,
        currentUserPersonalDetails?.accountID,
        currentUserPersonalDetails?.displayName,
        currentUserPersonalDetails?.login,
        delegators,
        isActingAsDelegate,
        isSmallScreenWidth,
        styles.accountSwitcherPopover,
        styles.buttonDefaultBG,
        styles.mt2,
        translate,
    ]);

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
                pressDimmingValue={canSwitchAccounts ? undefined : 1}
                wrapperStyle={[styles.flexGrow1, styles.flex1, styles.mnw0, styles.justifyContentCenter]}
            >
                <View style={[styles.flexRow, styles.gap3]}>
                    <Avatar
                        type={CONST.ICON_TYPE_AVATAR}
                        size={CONST.AVATAR_SIZE.MEDIUM}
                        avatarID={accountID}
                        source={avatarUrl}
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
                            {currentUserPersonalDetails?.login}
                        </Text>
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
                        <Text style={[styles.createMenuHeaderText, styles.ph5, styles.pb2, styles.pt4]}>{translate('delegate.switchAccount')}</Text>
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </View>
                </Popover>
            )}
        </>
    );
}

export default AccountSwitcher;
