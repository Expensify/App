import PropTypes from 'prop-types';
import CONST from '../CONST';
import stylePropTypes from '../styles/stylePropTypes';
import avatarPropTypes from './avatarPropTypes';

const propTypes = {
    /** Text to be shown as badge near the right end. */
    badgeText: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyle: stylePropTypes,

    /** Used to apply offline styles to child text components */
    style: stylePropTypes,

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

    /** Should the title show with normal font weight (not bold) */
    shouldShowBasicTitle: PropTypes.bool,

    /** Should the description be shown above the title (instead of the other way around) */
    shouldShowDescriptionOnTop: PropTypes.bool,

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
    iconType: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_ICON, CONST.ICON_TYPE_WORKSPACE]),

    /** Whether the menu item should be interactive at all */
    interactive: PropTypes.bool,

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.func,

    /** Avatars to show on the right of the menu item */
    floatRightAvatars: PropTypes.arrayOf(avatarPropTypes),

    /** The type of brick road indicator to show. */
    brickRoadIndicator: PropTypes.oneOf([CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR, CONST.BRICK_ROAD_INDICATOR_STATUS.INFO, '']),

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally: PropTypes.bool,
};

export default propTypes;
