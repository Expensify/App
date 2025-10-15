import React, {useState} from 'react';
import {View} from 'react-native';
import useLetterAvatars from '@hooks/useLetterAvatars';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
// import {CUSTOM_AVATAR_CATALOG} from '@libs/Avatars/CustomAvatarCatalog';
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
    firstName?: string;

    /** Optional: size of avatars in grid */
    size?: AvatarSizeName;

    /** Optional label to display above the grid */
    label?: string;
};

/**
 * AvatarSelector — renders a grid of selectable avatars.
 * Note: This component should be placed inside a ScrollView.
 */
function AvatarSelector({selectedID, onSelect, label, firstName, size = CONST.AVATAR_SIZE.MEDIUM}: AvatarSelectorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selected, setSelected] = useState(selectedID);

    const {avatarList: avatars} = useLetterAvatars(firstName, size);

    const handleSelect = (id: string) => {
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
                {/* {CUSTOM_AVATAR_CATALOG.map(({id, local}) => {
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
                })} */}
                {avatars.map(({id, component}) => {
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
                                source={component}
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
