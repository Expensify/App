import PropTypes from 'prop-types';
import networkPropTypes from '../networkPropTypes';

const propTypes = {
    /** Array of additional styles to add */
    style: PropTypes.arrayOf(PropTypes.object),

    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    /** Whether to include padding bottom */
    includePaddingBottom: PropTypes.bool,

    /** Whether to include padding top */
    includePaddingTop: PropTypes.bool,

    // Called when navigated Screen's transition is finished.
    onTransitionEnd: PropTypes.func,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** The behavior to pass to the KeyboardAvoidingView, requires some trial and error depending on the layout/devices used.
     *  Search 'switch(behavior)' in ./node_modules/react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js for more context */
    keyboardAvoidingViewBehavior: PropTypes.oneOf(['padding', 'height', 'position']),

    // react-navigation navigation object available to screen components
    navigation: PropTypes.shape({
        // Method to attach listener to Navigation state.
        addListener: PropTypes.func.isRequired,
    }),

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates when an Alert modal is about to be visible */
        willAlertModalBecomeVisible: PropTypes.bool,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    style: [],
    includePaddingBottom: true,
    includePaddingTop: true,
    onTransitionEnd: () => {},
    navigation: {
        addListener: () => {},
    },
    modal: {},
    keyboardAvoidingViewBehavior: 'padding',
};

export {propTypes, defaultProps};
