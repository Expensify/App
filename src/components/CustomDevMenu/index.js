import PropTypes from 'prop-types';

const propTypes = {
    /** Children to wrap in CustomDevMenu */
    children: PropTypes.node.isRequired,
};

const CustomDevMenu = props => (
    props.children
);

CustomDevMenu.propTypes = propTypes;
CustomDevMenu.displayName = 'CustomDevMenu';

export default CustomDevMenu;
