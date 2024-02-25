import React from 'react';
import {View} from 'react-native';
import type {HeaderIndice} from '@libs/EmojiUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CategoryShortcutButton from './CategoryShortcutButton';

type CategoryShortcutBarProps = {
    /** The function to call when an emoji is selected */
    onPress: (index: number) => void,

    /** The emojis consisting emoji code and indices that the icons should link to */
    headerEmojis: HeaderIndice[]
}

function CategoryShortcutBar(props: CategoryShortcutBarProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.ph4, styles.flexRow]}>
            {props.headerEmojis.map((headerEmoji, i) => (
                <CategoryShortcutButton
                    icon={headerEmoji.icon}
                    onPress={() => props.onPress(headerEmoji.index)}
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
