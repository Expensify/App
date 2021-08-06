import PropTypes from 'prop-types';

const propTypes = {
    /** Title of the Collapsible section */
    title: PropTypes.string.isRequired,

    /** Whether the section should start expanded. False by default */
    isExpanded: PropTypes.bool,

    /** Children to display inside the Collapsible component */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    isExpanded: false,
};

export {propTypes, defaultProps};
