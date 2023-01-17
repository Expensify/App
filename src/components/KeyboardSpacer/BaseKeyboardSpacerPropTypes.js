import PropTypes from 'prop-types';

const propTypes = {
    /** Top Spacing is used when there is a requirement of additional height to view. */
    topSpacing: PropTypes.number,

    /** Callback to update the value of keyboard status along with keyboard height + top spacing. */
    onToggle: PropTypes.func,

    /** Platform specific keyboard event to show keyboard https://reactnative.dev/docs/keyboard#addlistener */
    /** Pass keyboardShow event name as a param, since iOS and android both have different event names show keyboard. */
    keyboardShowMethod: PropTypes.string.isRequired,

    /** Platform specific keyboard event to hide keyboard https://reactnative.dev/docs/keyboard#addlistener */
    /** Pass keyboardHide event name as a param, since iOS and android both have different event names show keyboard. */
    keyboardHideMethod: PropTypes.string.isRequired,
};

const defaultProps = {
    topSpacing: 0,
    onToggle: () => null,
};

export {propTypes, defaultProps};
