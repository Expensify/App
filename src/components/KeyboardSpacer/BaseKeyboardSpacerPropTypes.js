import PropTypes from 'prop-types';

const propTypes = {
    /** Top Spacing is used when there requirement of additional height to view. */
    topSpacing: PropTypes.number,

    /** Callback to update the value of keybaord status along with current height. */
    onToggle: PropTypes.func,

    /** iOS uses LayoutAnimation.Types[event.easing]. */
    iOSAnimated: PropTypes.bool,

    /** Pass event name for keyboardShow since iOS and android both has different event to show keyboard. */
    keyboardShowMethod: PropTypes.string,

    /** Pass event name for keyboardHide since iOS and android both has different event to hide keyboard. */
    keyboardHideMethod: PropTypes.string,
};

const defaultProps = {
    topSpacing: 0,
    onToggle: () => null,
    style: [],
    iOSAnimated: false,
};

export {propTypes, defaultProps};
