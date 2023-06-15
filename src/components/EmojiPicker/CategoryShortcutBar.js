import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import CategoryShortcutButton from './CategoryShortcutButton';

const propTypes = {
    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** The emojis consisting emoji code and indices that the icons should link to */
    headerEmojis: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            index: PropTypes.number.isRequired,
            icon: PropTypes.func.isRequired,
        }),
    ).isRequired,
};

function CategoryShortcutBar(props) {
    return (
        <View style={[styles.ph4, styles.flexRow]}>
            {_.map(props.headerEmojis, (headerEmoji, i) => (
                <CategoryShortcutButton
                    icon={headerEmoji.icon}
                    onPress={() => props.onPress(headerEmoji.index)}
                    key={`categoryShortcut${i}`}
                    name={headerEmoji.name}
                />
            ))}
        </View>
    );
}

CategoryShortcutBar.propTypes = propTypes;
CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
