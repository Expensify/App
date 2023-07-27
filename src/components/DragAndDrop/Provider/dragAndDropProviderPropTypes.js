import PropTypes from 'prop-types';

export default {
    /** Children to render inside this component. */
    children: PropTypes.node.isRequired,

    /** ID for the drop zone. */
    dropZoneID: PropTypes.string.isRequired,

    /** ID for the Portal host where content can be rendered by consumers. */
    dropZoneHostName: PropTypes.string.isRequired,

    /** Should this dropZone be disabled? */
    isDisabled: PropTypes.bool,
};
