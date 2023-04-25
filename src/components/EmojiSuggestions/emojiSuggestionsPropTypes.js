import PropTypes from 'prop-types';

const propTypes = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex: PropTypes.number,

    /** Array of suggested emoji */
    emojis: PropTypes.arrayOf(PropTypes.shape({
        /** The emoji code */
        code: PropTypes.string,

        /** The name of the emoji */
        name: PropTypes.string,
    })).isRequired,

    /** Fired when the user selects an emoji */
    onSelect: PropTypes.func.isRequired,

    /** Emoji prefix that follows the colon  */
    prefix: PropTypes.string.isRequired,

    /** Show that we can use large emoji picker.
     * Depending on available space and whether the input is expanded, we can have a small or large emoji suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isEmojiPickerLarge: PropTypes.bool.isRequired,

    /** Show that we should include ReportRecipientLocalTime view height */
    shouldIncludeReportRecipientLocalTimeHeight: PropTypes.bool.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinToneIndex: PropTypes.number.isRequired,

    /** A ref to forward to the suggestion container */
    forwardedRef: PropTypes.object,
};

const defaultProps = {
    highlightedEmojiIndex: 0,
};

export {propTypes, defaultProps};
