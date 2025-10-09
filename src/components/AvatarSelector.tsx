import React, {useState} from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {ALL_CUSTOM_AVATARS} from '@libs/Avatars/CustomAvatarCatalog';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type AvatarSelectorProps = {
    /** Currently selected avatar ID */
    selectedID?: keyof typeof ALL_CUSTOM_AVATARS;

    /** Called when an avatar is selected */
    onSelect: (id: keyof typeof ALL_CUSTOM_AVATARS) => void;

    /** Optional: size of avatars in grid */
    size?: keyof typeof CONST.AVATAR_SIZE;

    /** Optional label to display above the grid */
    label?: string;
};

/**
 * AvatarSelector — renders a grid of selectable avatars.
 * Note: This component should be placed inside a ScrollView.
 */
function AvatarSelector({selectedID, onSelect, label, size = CONST.AVATAR_SIZE.MEDIUM}: AvatarSelectorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selected, setSelected] = useState(selectedID);

    const avatars = Object.entries(ALL_CUSTOM_AVATARS);

    const handleSelect = (id: keyof typeof ALL_CUSTOM_AVATARS) => {
        setSelected(id);
        onSelect(id);
    };

    return (
        <>
            {!!label && (
                <View style={[styles.pt5, styles.ph2]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>{label}</Text>
                </View>
            )}
            <View style={styles.avatarSelectorListContainer}>
                {avatars.map(([id, {url}]) => {
                    const isSelected = selected === id;

                    return (
                        <PressableWithFeedback
                            key={id}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel="Select Avatar"
                            onPress={() => handleSelect(id as keyof typeof ALL_CUSTOM_AVATARS)}
                            style={[styles.avatarSelectorWrapper, isSelected && {borderColor: theme.success, borderWidth: 2}]}
                        >
                            <Avatar
                                type={CONST.ICON_TYPE_AVATAR}
                                source={url}
                                size={CONST.AVATAR_SIZE[size]}
                                containerStyles={styles.avatarSelectorContainer}
                                testID={`AvatarSelector_${id}`}
                            />
                        </PressableWithFeedback>
                    );
                })}
            </View>
        </>
    );
}

export type {AvatarSelectorProps};
export default AvatarSelector;
