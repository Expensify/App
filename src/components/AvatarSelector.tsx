import React from 'react';
import {View} from 'react-native';
import useLetterAvatars from '@hooks/useLetterAvatars';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {PRESET_AVATAR_CATALOG_ORDERED} from '@libs/Avatars/PresetAvatarCatalog';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type AvatarSelectorProps = {
    /** Currently selected avatar ID */
    selectedID?: string;

    /** Called when an avatar is selected */
    onSelect: (id: string) => void;

    /** Used to generate letter avatars */
    name?: string;

    /** Optional: size of avatars in grid */
    size?: AvatarSizeName;

    /** Optional label to display above the grid */
    label?: string;
};

const SPACER_SIZE = 10;

/**
 * AvatarSelector — renders a grid of selectable avatars.
 */
function AvatarSelector({selectedID, onSelect, label, name, size = CONST.AVATAR_SIZE.MEDIUM}: AvatarSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {avatarList} = useLetterAvatars(name, size);

    const iconSize = StyleUtils.getAvatarSize(size);

    return (
        <>
            {!!label && avatarList?.length > 0 && (
                <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre, styles.ph2])}>{label}</Text>
            )}
            <View style={styles.avatarSelectorListContainer}>
                {PRESET_AVATAR_CATALOG_ORDERED.map(({id, local}) => {
                    const isSelected = selectedID === id;

                    return (
                        <PressableWithFeedback
                            key={id}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={translate('avatarPage.selectAvatar')}
                            onPress={() => onSelect(id)}
                            style={[styles.avatarSelectorWrapper, isSelected && {borderColor: theme.success, borderWidth: 2}]}
                        >
                            <Avatar
                                type={CONST.ICON_TYPE_AVATAR}
                                source={local}
                                size={size}
                                containerStyles={styles.avatarSelectorContainer}
                                testID={`AvatarSelector_${id}`}
                            />
                        </PressableWithFeedback>
                    );
                })}
                {avatarList.map(({id, StyledLetterAvatar}) => {
                    const isSelected = selectedID === id;

                    return (
                        <PressableWithFeedback
                            key={id}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={translate('avatarPage.selectAvatar')}
                            onPress={() => onSelect(id)}
                            style={[styles.avatarSelectorWrapper, isSelected && styles.avatarSelected]}
                        >
                            <Avatar
                                type={CONST.ICON_TYPE_AVATAR}
                                source={StyledLetterAvatar}
                                size={size}
                                containerStyles={styles.avatarSelectorContainer}
                                testID={`AvatarSelector_${id}`}
                            />
                        </PressableWithFeedback>
                    );
                })}
                {/* We need to add several invisible items at the end of the avatar list to guarantee that the last row avatars are aligned properly */}
                {[...Array(SPACER_SIZE).keys()].map((i) => (
                    <View
                        key={`spacer-${i}`}
                        style={[styles.avatarSelectorWrapper]}
                    >
                        <View style={{width: iconSize, height: iconSize}} />
                    </View>
                ))}
            </View>
        </>
    );
}

export type {AvatarSelectorProps};
export default AvatarSelector;
