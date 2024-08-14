import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {connect} from '@libs/actions/Delegate';
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

    const delegators = account?.delegatedAccess?.delegators ?? [];
    const shouldShowDelegators = delegators.length > 0 && canUseNewDotCopilot;

    const delegatorMenuItems: MenuItemProps[] = delegators.map(({email, role}) => {
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

    return (
        <>
            <PressableWithFeedback
                accessible
                accessibilityLabel={translate('common.profile')}
                onPress={() => {
                    setShouldShowDelegatorMenu(!shouldShowDelegatorMenu);
                }}
                ref={buttonRef}
                wrapperStyle={[styles.flexGrow1, styles.accountSwitcherWrapper, styles.justifyContentCenter]}
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
                                style={[styles.textBold]}
                            >
                                {currentUserPersonalDetails?.displayName}
                            </Text>
                            {shouldShowDelegators && (
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
                            style={styles.colorMuted}
                        >
                            {currentUserPersonalDetails?.login}
                        </Text>
                    </View>
                </View>
            </PressableWithFeedback>
            {shouldShowDelegators && (
                <Popover
                    isVisible={shouldShowDelegatorMenu}
                    onClose={() => setShouldShowDelegatorMenu(false)}
                    anchorRef={buttonRef}
                    anchorPosition={styles.accountSwitcherAnchorPosition}
                >
                    <View style={styles.pb4}>
                        <Text style={[styles.createMenuHeaderText, styles.ph5, styles.pb2, styles.pt4]}>{translate('delegate.switchAccount')}</Text>
                        <MenuItemList
                            menuItems={delegatorMenuItemsWithCurrentUser}
                            shouldUseSingleExecution
                        />
                        {/* TODO error handling on API error <Text style={[styles.textLabelError, styles.ph5, styles.pt4]}>Oops something went wrong. Please try again</Text> */}
                    </View>
                </Popover>
            )}
        </>
    );
}

export default AccountSwitcher;
