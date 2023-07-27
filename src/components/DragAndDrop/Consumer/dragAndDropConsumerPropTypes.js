import PropTypes from 'prop-types';

export default {
    /** Children to render inside this component. */
    children: PropTypes.node.isRequired,

    /** String ID to identify the dropZone. It should match the dropZoneID of the associated provider. */
    dropZoneID: PropTypes.string.isRequired,

    /** String name to identify the dropZone Portal. Multiple dropZoneIDs may share a single dropZoneHostName. */
    dropZoneHostName: PropTypes.string.isRequired,

    /** Function to execute when an item is dropped in the drop zone. */
    onDrop: PropTypes.func.isRequired,
};
