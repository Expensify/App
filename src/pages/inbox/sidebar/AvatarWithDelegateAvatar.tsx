import UserAvatar from '@components/Avatar/UserAvatar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSmallSizeAvatar} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import type {StyleProp} from 'react-native';
import type {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import React from 'react';
import {View} from 'react-native';

import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithDelegateAvatarProps = {
    /** Original account of delegate */
    delegateEmail: string;

    /** Whether the avatar is hovered */
    isHovered?: boolean;

    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Style for the Avatar container */
    containerStyle?: StyleProp<ViewStyle>;
};

function AvatarWithDelegateAvatar({delegateEmail, isHovered = false, isSelected = false, containerStyle}: AvatarWithDelegateAvatarProps) {
    const defaultAvatars = useDefaultAvatars();
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct avatar size
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const personalDetails = usePersonalDetails();
    const delegatePersonalDetail = Object.values(personalDetails ?? {}).find((personalDetail) => personalDetail?.login?.toLowerCase() === delegateEmail);

    return (
        <View style={[styles.sidebarStatusAvatarContainer, containerStyle]}>
            <ProfileAvatarWithIndicator isSelected={isSelected} />
            <View style={[styles.sidebarStatusAvatar, isHovered && styles.sidebarStatusAvatarHovered]}>
                <View style={styles.emojiStatusLHN}>
                    <UserAvatar
                        size={isSmallScreenWidth ? CONST.AVATAR_SIZE.XXX_SMALL : CONST.AVATAR_SIZE.SMALL}
                        source={getSmallSizeAvatar({avatarSource: delegatePersonalDetail?.avatar, accountID: delegatePersonalDetail?.accountID, defaultAvatars})}
                        fallbackIcon={delegatePersonalDetail?.fallbackIcon}
                        accountID={delegatePersonalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                    />
                </View>
            </View>
        </View>
    );
}

export default AvatarWithDelegateAvatar;
