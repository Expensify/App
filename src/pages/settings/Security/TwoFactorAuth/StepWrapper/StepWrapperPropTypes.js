import PropTypes from 'prop-types';

export default {
    /** Title of the Header */
    title: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        /** Current step */
        step: PropTypes.number,
        /** Total number of steps */
        total: PropTypes.number,
        /** Text to display next to the step counter */
        text: PropTypes.string,
    }),

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Called when navigated Screen's transition is finished. It does not fire when user exits the page. */
    onEntryTransitionEnd: PropTypes.func,

    /** Children components */
    children: PropTypes.node,

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView: PropTypes.bool,
};
