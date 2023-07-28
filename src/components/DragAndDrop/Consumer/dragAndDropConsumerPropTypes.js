import PropTypes from 'prop-types';

export default {
    /** Children to render inside this component. */
    children: PropTypes.node.isRequired,

    /** Function to execute when an item is dropped in the drop zone. */
    onDrop: PropTypes.func.isRequired,
};
