import PropTypes from 'prop-types';

const createMenuPropTypes = {
    // Callback method fired when the user requests to close the modal
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the modal or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,

    // Menu items to be rendered on the list
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            // An icon element displayed on the left side
            icon: PropTypes.elementType.isRequired,

            // Text label
            text: PropTypes.string.isRequired,

            // A callback triggered when this item is selected
            onSelected: PropTypes.func.isRequired,
        }),
    ).isRequired,
};

export default createMenuPropTypes;
