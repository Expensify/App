import PropTypes from 'prop-types';

export default {
    /** The function that should be called when this pressable is LongPressed or right-clicked. */
    onSecondaryInteraction: PropTypes.func.isRequired,

    /** The children which should be contained in this wrapper component. */
    children: PropTypes.node.isRequired,

    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: PropTypes.func,
};
