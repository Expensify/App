import PropTypes from 'prop-types';

const arrowKeyFocusManagerPropTypes = {
    /** Children to render. */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /** Array of disabled indexes. */
    disabledIndexes: PropTypes.arrayOf(PropTypes.number),

    /** The current focused index. */
    focusedIndex: PropTypes.number.isRequired,

    /** The maximum index – provided so that the focus can be sent back to the beginning of the list when the end is reached. */
    maxIndex: PropTypes.number.isRequired,

    /** A callback executed when the focused input changes. */
    onFocusedIndexChanged: PropTypes.func.isRequired,

    /** If this value is true, then we exclude TextArea Node. */
    shouldExcludeTextAreaNodes: PropTypes.bool,

    /** If this value is true, then the arrow down callback would be triggered when the max index is exceeded */
    shouldResetIndexOnEndReached: PropTypes.bool,

    /** Whether navigation is focused */
    isFocused: PropTypes.bool,
};

const arrowKeyFocusManagerDefaultProps = {
    disabledIndexes: [],
    shouldExcludeTextAreaNodes: true,
    shouldResetIndexOnEndReached: true,
};

export {arrowKeyFocusManagerDefaultProps, arrowKeyFocusManagerPropTypes};
