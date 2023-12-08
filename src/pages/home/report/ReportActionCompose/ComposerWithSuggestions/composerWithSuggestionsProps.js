import PropTypes from 'prop-types';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import CONST from '@src/CONST';

const propTypes = {
    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates if there is a modal currently visible or not */
        isVisible: PropTypes.bool,
    }),

    /** User's preferred skin tone color */
    preferredSkinTone: PropTypes.number,

    /** Number of lines for the composer */
    numberOfLines: PropTypes.number,

    /** Whether the keyboard is open or not */
    isKeyboardShown: PropTypes.bool.isRequired,

    /** The actions from the parent report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** The ID of the report */
    reportID: PropTypes.string.isRequired,

    /** The report currently being looked at */
    report: PropTypes.shape({
        parentReportID: PropTypes.string,
    }).isRequired,

    /** Callback when the input is focused */
    onFocus: PropTypes.func.isRequired,

    /** Callback when the input is blurred */
    onBlur: PropTypes.func.isRequired,

    /** Whether the composer is full size or not */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Whether the menu is visible or not */
    isMenuVisible: PropTypes.bool.isRequired,

    /** Placeholder text for the input */
    inputPlaceholder: PropTypes.string.isRequired,

    /** Function to display a file in the modal */
    displayFileInModal: PropTypes.func.isRequired,

    /** Whether the text input should be cleared or not */
    textInputShouldClear: PropTypes.bool.isRequired,

    /** Function to set whether the text input should be cleared or not */
    setTextInputShouldClear: PropTypes.func.isRequired,

    /** Whether the user is blocked from concierge or not */
    isBlockedFromConcierge: PropTypes.bool.isRequired,

    /** Whether the input is disabled or not */
    disabled: PropTypes.bool.isRequired,

    /** Whether the full composer is available or not */
    isFullComposerAvailable: PropTypes.bool.isRequired,

    /** Function to set whether the full composer is available or not */
    setIsFullComposerAvailable: PropTypes.func.isRequired,

    /** Function to set whether the comment is empty or not */
    setIsCommentEmpty: PropTypes.func.isRequired,

    /** A method to call when the form is submitted */
    handleSendMessage: PropTypes.func.isRequired,

    /** Whether the compose input is shown or not */
    shouldShowComposeInput: PropTypes.bool.isRequired,

    /** Meaures the parent container's position and dimensions. */
    measureParentContainer: PropTypes.func,

    /** Ref for the suggestions component */
    suggestionsRef: PropTypes.shape({
        current: PropTypes.shape({
            /** Update the shouldShowSuggestionMenuToFalse prop */
            updateShouldShowSuggestionMenuToFalse: PropTypes.func.isRequired,

            /** Trigger hotkey actions */
            triggerHotkeyActions: PropTypes.func.isRequired,

            /** Check if suggestion calculation should be blocked */
            setShouldBlockSuggestionCalc: PropTypes.func.isRequired,

            /** Callback when the selection changes */
            onSelectionChange: PropTypes.func.isRequired,
        }),
    }).isRequired,

    /** Ref for the animated view (text input) */
    animatedRef: PropTypes.func.isRequired,

    /** Ref for the composer */
    forwardedRef: PropTypes.shape({current: PropTypes.shape({})}),

    /** Ref for the isNextModalWillOpen */
    isNextModalWillOpenRef: PropTypes.shape({current: PropTypes.bool.isRequired}).isRequired,
};

const defaultProps = {
    modal: {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    numberOfLines: undefined,
    parentReportActions: {},
    reportActions: [],
    forwardedRef: null,
    measureParentContainer: () => {},
};

export {propTypes, defaultProps};
