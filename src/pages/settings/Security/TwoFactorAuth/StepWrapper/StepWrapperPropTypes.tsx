type StepWrapperPropTypes = {
    /** Title of the Header */
    title?: string;

    /** Data to display a step counter in the header */
    stepCounter?: {
        /** Current step */
        step: number;
        /** Total number of steps */
        total?: number;
        /** Text to display next to the step counter */
        text?: string;
    };

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Called when navigated Screen's transition is finished. It does not fire when user exits the page. */
    onEntryTransitionEnd?: () => void;

    /** Children components */
    children?: React.ReactNode;

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView?: boolean;
};

export default StepWrapperPropTypes;
