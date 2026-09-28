import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarSkeleton from '@components/AvatarSkeleton';
import Indicator from '@components/Indicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSmallSizeAvatar} from '@libs/UserAvatarUtils';

import type {AvatarSizeName} from '@styles/utils/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp} from 'react-native';
import type {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import React from 'react';
import {View} from 'react-native';

type ProfileAvatarWithIndicatorProps = {
    isSelected?: boolean;
    containerStyles?: StyleProp<ViewStyle>;
    size?: AvatarSizeName;
};

function ProfileAvatarWithIndicator({isSelected = false, containerStyles, size = CONST.AVATAR_SIZE.SMALL}: ProfileAvatarWithIndicatorProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const isLoading = !!(isLoadingApp && !currentUserPersonalDetails.avatar);

    return (
        <OfflineWithFeedback
            pendingAction={currentUserPersonalDetails.pendingFields?.avatar}
            style={containerStyles}
        >
            <View style={[styles.pRelative]}>
                <View
                    style={[isSelected && StyleUtils.getSelectedAvatarRingStyle(size), styles.pAbsolute]}
                    testID="avatar-ring"
                />
                <View style={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))}>
                    {isLoading ? (
                        <AvatarSkeleton size={size} />
                    ) : (
                        <>
                            <UserAvatar
                                size={size}
                                source={getSmallSizeAvatar({
                                    avatarSource: currentUserPersonalDetails.avatar,
                                    accountID: currentUserPersonalDetails.accountID,
                                    defaultAvatars,
                                })}
                                fallbackIcon={currentUserPersonalDetails.fallbackIcon ?? defaultAvatars.FallbackAvatar}
                                accountID={currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID}
                            />
                            <Indicator />
                        </>
                    )}
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

export default ProfileAvatarWithIndicator;
