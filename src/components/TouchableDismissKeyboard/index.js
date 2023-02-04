import PropTypes from 'prop-types';

const propTypes = {
    /** The children which should be contained in this wrapper component. */
    children: PropTypes.node.isRequired,
};

const TouchableDismissKeyboard = props => props.children;

TouchableDismissKeyboard.propTypes = propTypes;
TouchableDismissKeyboard.displayName = 'TouchableDismissKeyboard';

export default TouchableDismissKeyboard;
