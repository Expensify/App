import React from 'react';
import PropTypes from 'prop-types';
import {Image, Pressable} from 'react-native';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Text from '../Text';

const propTypes = {
    /** The unicode that is used to display the emoji */
    emoji: PropTypes.func.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHoverIn: PropTypes.func,

    /** Handles what to do when the hover is out */
    onHoverOut: PropTypes.func,

    /** Whether this menu item is currently highlighted or not */
    isHighlighted: PropTypes.bool,
};

const CategoryShortcutButton = props => (
    <Pressable
        onPress={props.onPress}
        onHoverIn={props.onHoverIn}
        onHoverOut={props.onHoverOut}
        style={({pressed}) => ([
            StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
            props.isHighlighted && styles.emojiItemHighlighted,
            styles.categoryShortcutButton,
        ])}
    >
        <Image
            style={styles.emojiText}
            source={{uri: props.emoji}}
        />
    </Pressable>

);
CategoryShortcutButton.propTypes = propTypes;
CategoryShortcutButton.displayName = 'CategoryShortcutButton';
CategoryShortcutButton.defaultProps = {
    isHighlighted: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
};

export default CategoryShortcutButton;
