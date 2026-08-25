import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp} from 'react-native';
import type {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import React from 'react';
import {View} from 'react-native';

import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithOptionalStatusProps = {
    emojiStatus?: string;

    isSelected?: boolean;

    containerStyle?: StyleProp<ViewStyle>;
};

function AvatarWithOptionalStatus({emojiStatus = '', isSelected = false, containerStyle}: AvatarWithOptionalStatusProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.sidebarStatusAvatarContainer, containerStyle]}>
            <ProfileAvatarWithIndicator isSelected={isSelected} />
            <View style={styles.sidebarStatusAvatar}>
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
