import PropTypes from 'prop-types';

const propTypes = {
    /** Array of suggestions */
    // eslint-disable-next-line react/forbid-prop-types
    suggestions: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Function used to render each suggestion, returned JSX will be enclosed inside a Pressable component */
    renderSuggestionMenuItem: PropTypes.func.isRequired,

    /** Create unique keys for each suggestion item */
    keyExtractor: PropTypes.func.isRequired,

    /** The index of the highlighted suggestion */
    highlightedSuggestionIndex: PropTypes.number.isRequired,

    /** Fired when the user selects a suggestion */
    onSelect: PropTypes.func.isRequired,

    /** Show that we can use large auto-complete suggestion picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isSuggestionPickerLarge: PropTypes.bool.isRequired,

    /** create accessibility label for each item */
    accessibilityLabelExtractor: PropTypes.func.isRequired,

    /** Meaures the parent container's position and dimensions. */
    measureParentContainer: PropTypes.func,
};

const defaultProps = {
    measureParentContainer: () => {},
};

export {propTypes, defaultProps};
