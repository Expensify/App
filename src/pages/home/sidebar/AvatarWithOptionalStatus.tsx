import React from 'react';
import {View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';

type AvatarWithOptionalStatusProps = {
    /** Emoji status */
    emojiStatus?: string;

    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Callback called when the avatar or status icon is pressed */
    onPress?: () => void;
};

function AvatarWithOptionalStatus({emojiStatus = '', isSelected = false, onPress}: AvatarWithOptionalStatusProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.sidebarStatusAvatarContainer}>
            <PressableAvatarWithIndicator
                isSelected={isSelected}
                onPress={onPress}
            />
            <PressableWithoutFeedback
                accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                role={CONST.ROLE.BUTTON}
                onPress={onPress}
                style={[styles.sidebarStatusAvatar]}
            >
                <Text
                    style={styles.emojiStatusLHN}
                    numberOfLines={1}
                >
                    {emojiStatus}
                </Text>
            </PressableWithoutFeedback>
        </View>
    );
}

AvatarWithOptionalStatus.displayName = 'AvatarWithOptionalStatus';
export default AvatarWithOptionalStatus;
