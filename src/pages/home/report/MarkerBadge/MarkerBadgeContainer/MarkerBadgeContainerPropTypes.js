import PropTypes from 'prop-types';

const propTypes = {
    /** Container Styles */
    containerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Children of the MakerBadgeContainer */
    children: PropTypes.element.isRequired,
};

export default propTypes;
