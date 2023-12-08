import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useThemeStyles from '@styles/useThemeStyles';
import CategoryShortcutButton from './CategoryShortcutButton';

const propTypes = {
    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** The emojis consisting emoji code and indices that the icons should link to */
    headerEmojis: PropTypes.arrayOf(
        PropTypes.shape({
            code: PropTypes.string.isRequired,
            index: PropTypes.number.isRequired,
            icon: PropTypes.func.isRequired,
        }),
    ).isRequired,
};

function CategoryShortcutBar(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.ph4, styles.flexRow]}>
            {_.map(props.headerEmojis, (headerEmoji, i) => (
                <CategoryShortcutButton
                    icon={headerEmoji.icon}
                    onPress={() => props.onPress(headerEmoji.index)}
                    key={`categoryShortcut${i}`}
                    code={headerEmoji.code}
                />
            ))}
        </View>
    );
}

CategoryShortcutBar.propTypes = propTypes;
CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
