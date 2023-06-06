import PropTypes from 'prop-types';
import refPropTypes from '../refPropTypes';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** The function that should be called when this pressable is pressed */
    onPress: PropTypes.func,

    /** The function that should be called when this pressable is pressedIn */
    onPressIn: PropTypes.func,

    /** The function that should be called when this pressable is pressedOut */
    onPressOut: PropTypes.func,

    /** The function that should be called when this pressable is LongPressed or right-clicked. */
    onSecondaryInteraction: PropTypes.func,

    /** The children which should be contained in this wrapper component. */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: refPropTypes,

    /** Prevent the default ContextMenu on web/Desktop */
    preventDefaultContextMenu: PropTypes.bool,

    /** Use Text instead of Pressable to create inline layout.
     * It has few limitations in comparison to Pressable.
     *
     * - No support for delayLongPress.
     * - No support for pressIn and pressOut events.
     * - No support for opacity
     *
     * Note: Web uses styling instead of Text due to no support of LongPress. Thus above pointers are not valid for web.
     */
    inline: PropTypes.bool,

    /** Disable focus trap for the element on secondary interaction  */
    withoutFocusOnSecondaryInteraction: PropTypes.bool,

    /** Opacity to reduce to when active  */
    activeOpacity: PropTypes.number,

    /** Used to apply styles to the Pressable */
    style: stylePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    onPressIn: () => {},
    onPressOut: () => {},
    preventDefaultContextMenu: true,
    inline: false,
    withoutFocusOnSecondaryInteraction: false,
    activeOpacity: 1,
    enableLongPressWithHover: false,
};

export {propTypes, defaultProps};
