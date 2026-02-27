type EmojiPickerMenuItemProps = {
    /** The unicode that is used to display the emoji */
    emoji: string;

    /** The function to call when an emoji is selected */
    onPress: (emoji: string) => void;

    /** Handles what to do when we hover over this item with our cursor */
    onHoverIn?: () => void;

    /** Handles what to do when the hover is out */
    onHoverOut?: () => void;

    /** Handles what to do when the pressable is focused */
    onFocus?: () => void;

    /** Handles what to do when the pressable is blurred */
    onBlur?: () => void;

    /** Whether this menu item is currently focused or not */
    isFocused?: boolean;

    /** Whether the menu item should be highlighted or not */
    isHighlighted?: boolean;

    /** Whether the emoji is highlighted by the keyboard/mouse */
    isUsingKeyboardMovement?: boolean;
};

export default EmojiPickerMenuItemProps;
