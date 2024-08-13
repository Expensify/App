import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Avatar from './Avatar';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MenuItem from './MenuItem';
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
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [shouldShowDelegateMenu, setShouldShowDelegateMenu] = useState(false);

    const buttonRef = useRef<HTMLDivElement>(null);

    const delegates = account?.delegatedAccess?.delegates ?? [];
    const shouldShowDelegates = delegates.length > 0 && canUseNewDotCopilot;
    const {isSmallScreenWidth} = useResponsiveLayout();

    const delegateMenuItems = delegates.map(({email, role}) => {
        const personalDetail = getPersonalDetailByEmail(email);

        return {
            key: email,
            title: personalDetail?.displayName ?? email,
            description: personalDetail?.displayName ? email : '',
            badgeText: Str.recapitalize(role),
            onPress: () => {},
            avatarID: personalDetail?.accountID ?? -1,
            icon: personalDetail?.avatar ?? '',
            iconType: CONST.ICON_TYPE_AVATAR,
            outerWrapperStyle: isSmallScreenWidth ? {} : styles.accountSwitcherPopover,
            numberOfLinesDescription: 1,
        };
    });

    const delegateMenuItemsWithCurrentUser = [
        {
            key: currentUserPersonalDetails?.login,
            title: currentUserPersonalDetails?.displayName ?? currentUserPersonalDetails?.login,
            description: currentUserPersonalDetails?.displayName ? currentUserPersonalDetails?.login : '',
            onPress: () => {},
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
        ...delegateMenuItems,
    ];

    return (
        <>
            <PressableWithFeedback
                accessible
                accessibilityLabel={translate('common.profile')}
                onPress={() => {
                    setShouldShowDelegateMenu(!shouldShowDelegateMenu);
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
                    <View style={[styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter]}>
                        <View style={[styles.flexRow, styles.gap1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.textBold]}
                            >
                                {currentUserPersonalDetails?.displayName}
                            </Text>
                            {shouldShowDelegates && (
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
            {shouldShowDelegates && (
                <Popover
                    isVisible={shouldShowDelegateMenu}
                    onClose={() => setShouldShowDelegateMenu(false)}
                    anchorRef={buttonRef}
                    anchorPosition={styles.accountSwitcherAnchorPosition}
                >
                    <View style={styles.pb4}>
                        <Text style={[styles.createMenuHeaderText, styles.ph5, styles.pb2, styles.pt4]}>{translate('delegate.switchAccount')}</Text>
                        {delegateMenuItemsWithCurrentUser.map((item) => (
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            <MenuItem {...item} />
                        ))}
                    </View>
                </Popover>
            )}
        </>
    );
}

export default AccountSwitcher;
