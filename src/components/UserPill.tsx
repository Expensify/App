import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import UserAvatar from './Avatar/UserAvatar';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type UserPillProps = {
    avatar?: AvatarSource;
    displayName: string;
    accountID?: number;
    email?: string;
    style?: StyleProp<ViewStyle>;
    isSelectable?: boolean;

    /** Shown inside the pill after the name, outside the user details tooltip, so hovering it shows only its own tooltip */
    children?: ReactNode;
};

function UserPill({avatar, displayName, accountID, email, style, isSelectable = false, children}: UserPillProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {formatPhoneNumber} = useLocalize();

    // `displayName` is a person's name unless they never set one, in which case it is their SMS login.
    const formattedDisplayName = Str.isSMSLogin(displayName) ? formatPhoneNumber(displayName) : displayName;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart, styles.userPill, shouldUseNarrowLayout && styles.mw100, style]}>
            <UserDetailsTooltip
                accountID={accountID ?? CONST.DEFAULT_NUMBER_ID}
                fallbackUserDetails={{
                    avatar,
                    displayName: formattedDisplayName,
                    login: email ?? displayName,
                }}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexShrink1, styles.gap1]}>
                    <View
                        style={isSelectable && styles.userSelectNone}
                        dataSet={isSelectable ? {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true} : undefined}
                    >
                        <UserAvatar
                            source={avatar}
                            size={CONST.AVATAR_SIZE.XXX_SMALL}
                            accountID={accountID ?? CONST.DEFAULT_NUMBER_ID}
                        />
                    </View>
                    <Text
                        style={styles.userPillText}
                        numberOfLines={1}
                        selectable={isSelectable || undefined}
                        dataSet={isSelectable ? COPYABLE_TEXT_DATA_SET : undefined}
                    >
                        {formattedDisplayName}
                    </Text>
                </View>
            </UserDetailsTooltip>
            {children}
        </View>
    );
}

UserPill.displayName = 'UserPill';

export default UserPill;
