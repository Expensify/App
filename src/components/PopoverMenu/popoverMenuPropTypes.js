import PropTypes from 'prop-types';
import CONST from '../../CONST';

const propTypes = {
    /** Callback method fired when the user requests to close the modal */
    onClose: PropTypes.func.isRequired,

    /** State that determines whether to display the modal or not */
    isVisible: PropTypes.bool.isRequired,

    /** Callback to fire when a CreateMenu item is selected */
    onItemSelected: PropTypes.func.isRequired,

    /** Menu items to be rendered on the list */
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            /** An icon element displayed on the left side */
            icon: PropTypes.elementType,

            /** Text label */
            text: PropTypes.string.isRequired,

            /** A callback triggered when this item is selected */
            onSelected: PropTypes.func.isRequired,
        }),
    ).isRequired,

    /** The anchor position of the CreateMenu popover */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** The anchor reference of the CreateMenu popover */
    anchorRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,

    /** A react-native-animatable animation definition for the modal display animation. */
    animationIn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /** A react-native-animatable animation definition for the modal hide animation. */
    animationOut: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /** A react-native-animatable animation timing for the modal display animation. */
    animationInTiming: PropTypes.number,

    /** Optional non-interactive text to display as a header for any create menu */
    headerText: PropTypes.string,

    /** Whether disable the animations */
    disableAnimation: PropTypes.bool,
};

const defaultProps = {
    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
    animationInTiming: CONST.ANIMATED_TRANSITION,
    headerText: undefined,
    disableAnimation: true,
};

export {propTypes, defaultProps};
