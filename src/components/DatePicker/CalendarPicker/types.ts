type RadioItem = {
    /** Text to display */
    text: string;

    /** Alternate text to display */
    alternateText?: string;

    /** Key used internally by React */
    keyForList: string;

    /** Whether this option is selected */
    isSelected?: boolean;

    /** Element to show on the right side of the item */
    rightElement?: undefined;

    /** Whether this option is disabled for selection */
    isDisabled?: undefined;

    invitedSecondaryLogin?: undefined;

    /** Errors that this user may contain */
    errors?: undefined;

    /** The type of action that's pending  */
    pendingAction?: undefined;

    value: number;
};

export default RadioItem;
