import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {HeaderIndice} from '@libs/EmojiUtils';
import CategoryShortcutButton from './CategoryShortcutButton';

type CategoryShortcutBarProps = {
    /** The function to call when an emoji is selected */
    onPress: (index: number) => void;

    /** The emojis consisting emoji code and indices that the icons should link to */
    headerEmojis: HeaderIndice[];
};

function CategoryShortcutBar({onPress, headerEmojis}: CategoryShortcutBarProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.ph4, styles.flexRow]}>
            {headerEmojis.map((headerEmoji, i) => (
                <CategoryShortcutButton
                    icon={headerEmoji.icon}
                    onPress={() => onPress(headerEmoji.index)}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`categoryShortcut${i}`}
                    code={headerEmoji.code}
                />
            ))}
        </View>
    );
}

CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
