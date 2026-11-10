import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AvatarSizeName} from '@styles/utils/types';

import CONST from '@src/CONST';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithOptionalStatusProps = {
    emojiStatus?: string;
    isSelected?: boolean;

    /** Stroke of the status badge in place of the default one */
    badgeBorderColor?: ColorValue;
    size?: AvatarSizeName;
};

function AvatarWithOptionalStatus({emojiStatus = '', isSelected = false, size = CONST.AVATAR_SIZE.SMALL, badgeBorderColor}: AvatarWithOptionalStatusProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View style={[styles.sidebarStatusAvatarContainer, StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))]}>
            <ProfileAvatarWithIndicator
                isSelected={isSelected}
                size={size}
            />
            <View style={[styles.sidebarStatusAvatar, !!badgeBorderColor && StyleUtils.getBorderColorStyle(badgeBorderColor)]}>
                <View>
                    <Text
                        style={styles.emojiStatusLHN}
                        numberOfLines={1}
                    >
                        {emojiStatus}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default AvatarWithOptionalStatus;
