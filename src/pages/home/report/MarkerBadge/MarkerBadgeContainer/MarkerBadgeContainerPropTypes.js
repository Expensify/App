import PropTypes from 'prop-types';

const propTypes = {
    /** Styles to be assigned to Container */
    containerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Rendered child component */
    children: PropTypes.element.isRequired,
};

export default propTypes;
