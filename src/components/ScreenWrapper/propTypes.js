import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';
import {environmentPropTypes} from '../withEnvironment';

const propTypes = {
    /** Array of additional styles to add */
    style: PropTypes.arrayOf(PropTypes.object),

    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,

    /** Whether to include padding bottom */
    includeSafeAreaPaddingBottom: PropTypes.bool,

    /** Whether to include padding top */
    includePaddingTop: PropTypes.bool,

    /** Called when navigated Screen's transition is finished. It does not fire when user exit the page. */
    onEntryTransitionEnd: PropTypes.func,

    /** The behavior to pass to the KeyboardAvoidingView, requires some trial and error depending on the layout/devices used.
     *  Search 'switch(behavior)' in ./node_modules/react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js for more context */
    keyboardAvoidingViewBehavior: PropTypes.oneOf(['padding', 'height', 'position']),

    /** Whether picker modal avoiding should be enabled. Should be enabled when there's a picker at the bottom of a
     *  scrollable form, gives a subtly better UX if disabled on non-scrollable screens with a submit button */
    shouldEnablePickerAvoiding: PropTypes.bool,

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates when an Alert modal is about to be visible */
        willAlertModalBecomeVisible: PropTypes.bool,
    }),

    /** Whether to dismiss keyboard before leaving a screen */
    shouldDismissKeyboardBeforeClose: PropTypes.bool,

    /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
    shouldEnableMaxHeight: PropTypes.bool,

    ...windowDimensionsPropTypes,

    ...environmentPropTypes,
};

const defaultProps = {
    style: [],
    includeSafeAreaPaddingBottom: true,
    shouldDismissKeyboardBeforeClose: true,
    includePaddingTop: true,
    onEntryTransitionEnd: () => {},
    modal: {},
    keyboardAvoidingViewBehavior: 'padding',
    shouldEnableMaxHeight: false,
    shouldEnablePickerAvoiding: true,
};

export {propTypes, defaultProps};
