import PropTypes from 'prop-types';

const propTypes = {
    /** Hide the ReactionList modal popover */
    onClose: PropTypes.func,

    /** The emoji codes */
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** The name of the emoji */
    emojiName: PropTypes.string.isRequired,

    /** Count of the emoji */
    emojiCount: PropTypes.number.isRequired,

    /**
     * The default size of the reaction bubble is defined
     * by the styles in styles.js. This scale factor can be used
     * to make the bubble bigger or smaller.
     */
    sizeScale: PropTypes.number,
};

const defaultProps = {
    sizeScale: 1,
};

export {propTypes, defaultProps};
