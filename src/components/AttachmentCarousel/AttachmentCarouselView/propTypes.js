import PropTypes from 'prop-types';

const propTypes = {
    /**
     * The current state of the carousel
     */
    carouselState: PropTypes.shape({
        page: PropTypes.number.isRequired,
        attachments: PropTypes.arrayOf(PropTypes.element).isRequired,
        shouldShowArrow: PropTypes.bool.isRequired,
        containerWidth: PropTypes.number.isRequired,
        containerHeight: PropTypes.number.isRequired,
        activeSource: PropTypes.string,
    }).isRequired,

    /**
     * A callback to update the page in the carousel component
     */
    updatePage: PropTypes.func.isRequired,

    /**
     * A callback for toggling the visibility of the arrows
     */
    toggleArrowsVisibility: PropTypes.func.isRequired,

    /**
     * Trigger "auto-hiding" of the arrow buttons in the carousel
     */
    autoHideArrow: PropTypes.func.isRequired,

    /**
     * Cancel "auto-hiding" of the arrow buttons in the carousel
     */
    cancelAutoHideArrow: PropTypes.func.isRequired,
};

export default propTypes;
