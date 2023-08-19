import PropTypes from 'prop-types';
import _ from 'underscore';
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

    /** Used to apply styles specifically to the title */
    titleStyle: stylePropTypes,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func,

    /** Icon to display on the left side of component */
    icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string, PropTypes.arrayOf(avatarPropTypes)]),

    /** Secondary icon to display on the left side of component, right of the icon */
    secondaryIcon: PropTypes.elementType,

    /** Icon Width */
    iconWidth: PropTypes.number,

    /** Icon Height */
    iconHeight: PropTypes.number,

    /** Text to display for the item */
    title: PropTypes.string,

    /** Text that appears above the title */
    label: PropTypes.string,

    /** Boolean whether to display the title right icon */
    shouldShowTitleIcon: PropTypes.bool,

    /** Icon to display at right side of title */
    titleIcon: PropTypes.func,

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

    /** The fill color to pass into the secondary icon. */
    secondaryIconFill: PropTypes.string,

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

    /** Prop to represent the size of the float right avatar images to be shown */
    floatRightAvatarSize: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Prop to represent the size of the avatar images to be shown */
    avatarSize: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** The function that should be called when this component is LongPressed or right-clicked. */
    onSecondaryInteraction: PropTypes.func,

    /** Flag to indicate whether or not text selection should be disabled from long-pressing the menu item. */
    shouldBlockSelection: PropTypes.bool,

    /** The ref to the menu item */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    /** Any adjustments to style when menu item is hovered or pressed */
    hoverAndPressStyle: PropTypes.arrayOf(PropTypes.object),

    /** Text to display under the main item */
    furtherDetails: PropTypes.string,

    /** An icon to display under the main item */
    furtherDetailsIcon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),

    /** The action accept for anonymous user or not */
    isAnonymousAction: PropTypes.bool,

    /**  Whether we should use small avatar subscript sizing the for menu item */
    isSmallAvatarSubscriptMenu: PropTypes.bool,

    /** The max number of lines the title text should occupy before ellipses are added */
    numberOfLines: PropTypes.number,

    /** Should we grey out the menu item when it is disabled? */
    shouldGreyOutWhenDisabled: PropTypes.bool,
};

export default propTypes;
