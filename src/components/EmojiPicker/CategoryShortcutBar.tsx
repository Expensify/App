import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {HeaderIndices} from '@libs/EmojiUtils';
import CategoryShortcutButton from './CategoryShortcutButton';

type CategoryShortcutBarProps = {
    /** The function to call when an emoji is selected */
    onPress: (index: number) => void;

    /** The emojis consisting emoji code and indices that the icons should link to */
    headerEmojis: HeaderIndices[];
};

function CategoryShortcutBar({onPress, headerEmojis}: CategoryShortcutBarProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.ph4, styles.flexRow]}>
            {headerEmojis.map((headerEmoji) => (
                <CategoryShortcutButton
                    icon={headerEmoji.icon}
                    onPress={() => onPress(headerEmoji.index)}
                    key={`categoryShortcut${headerEmoji.index}`}
                    code={headerEmoji.code}
                />
            ))}
        </View>
    );
}

export default CategoryShortcutBar;
