import React from 'react';
import {View} from 'react-native';
import type {StyleProp} from 'react-native';
import type {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import Avatar from '@components/Avatar';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSmallSizeAvatar} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithDelegateAvatarProps = {
    /** Original account of delegate */
    delegateEmail: string;

    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Style for the Avatar container */
    containerStyle?: StyleProp<ViewStyle>;
};

function AvatarWithDelegateAvatar({delegateEmail, isSelected = false, containerStyle}: AvatarWithDelegateAvatarProps) {
    const defaultAvatars = useDefaultAvatars();
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct avatar size
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const personalDetails = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const delegatePersonalDetail = Object.values(personalDetails?.[0] ?? {}).find((personalDetail) => personalDetail?.login?.toLowerCase() === delegateEmail);

    return (
        <View style={[styles.sidebarStatusAvatarContainer, containerStyle]}>
            <ProfileAvatarWithIndicator isSelected={isSelected} />
            <View style={[styles.sidebarStatusAvatar]}>
                <View style={styles.emojiStatusLHN}>
                    <Avatar
                        size={isSmallScreenWidth ? CONST.AVATAR_SIZE.MID_SUBSCRIPT : CONST.AVATAR_SIZE.SMALL}
                        source={getSmallSizeAvatar({avatarSource: delegatePersonalDetail?.avatar, accountID: delegatePersonalDetail?.accountID, defaultAvatars})}
                        fallbackIcon={delegatePersonalDetail?.fallbackIcon}
                        type={CONST.ICON_TYPE_AVATAR}
                    />
                </View>
            </View>
        </View>
    );
}

export default AvatarWithDelegateAvatar;
