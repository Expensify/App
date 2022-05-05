import PropTypes from 'prop-types';
import CONST from '../CONST';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Text to be shown as badge near the right end. */
    badgeText: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyle: stylePropTypes,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func,

    /** Icon to display on the left side of component */
    icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),

    /** Icon Width */
    iconWidth: PropTypes.number,

    /** Icon Height */
    iconHeight: PropTypes.number,

    /** Text to display for the item */
    title: PropTypes.string.isRequired,

    /** Boolean whether to display the right icon */
    shouldShowRightIcon: PropTypes.bool,

    /** Should we make this selectable with a checkbox */
    shouldShowSelectedState: PropTypes.bool,

    /** Whether this item is selected */
    isSelected: PropTypes.bool,

    /** A boolean flag that gives the icon a green fill if true */
    success: PropTypes.bool,

    /** Overrides the icon for shouldShowRightIcon */
    iconRight: PropTypes.elementType,

    /** A description text to show under the title */
    description: PropTypes.string,

    /** Any additional styles to pass to the icon container. */
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Whether item is focused or active */
    focused: PropTypes.bool,

    /** Should we disable this menu item? */
    disabled: PropTypes.bool,

    /** A right-aligned subtitle for this menu option */
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** Flag to choose between avatar image or an icon */
    iconType: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_ICON]),

    /** Whether the menu item should be interactive at all */
    interactive: PropTypes.bool,

    /** Function for using fallback avatar */
    fallbackIcon: PropTypes.func,
};

export default propTypes;
