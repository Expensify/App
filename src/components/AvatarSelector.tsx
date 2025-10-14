import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ALL_CUSTOM_AVATARS} from '@libs/Avatars/CustomAvatarCatalog';
import {ALL_CUSTOM_AVATARS_ORDERED} from '@libs/Avatars/CustomAvatarCatalog';
import type {AvatarSizeName} from '@styles/utils';
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
    size?: AvatarSizeName;

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

    useEffect(() => {
        if (selectedID === selected) {
            return;
        }
        setSelected(selectedID);
    }, [selected, selectedID]);

    const handleSelect = (id: keyof typeof ALL_CUSTOM_AVATARS) => {
        setSelected(id);
        onSelect(id);
    };

    return (
        <>
            {!!label && (
                <View style={[styles.pt3, styles.ph2]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>{label}</Text>
                </View>
            )}
            <View style={styles.avatarSelectorListContainer}>
                {ALL_CUSTOM_AVATARS_ORDERED.map(({id, local}) => {
                    const isSelected = selected === id;

                    return (
                        <PressableWithFeedback
                            key={id}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel="Select Avatar"
                            onPress={() => handleSelect(id)}
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
            </View>
        </>
    );
}

AvatarSelector.displayName = 'AvatarSelector';

export type {AvatarSelectorProps};
export default AvatarSelector;
