import React from 'react';
import {
    View, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles, {getButtonBackgroundColorStyle, getIconFillColor} from '../styles/styles';
import Icon from './Icon';
import {ArrowRight} from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import Badge from './Badge';

const propTypes = {
    // Text to be shown as badge near the right end.
    badgeText: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyle: PropTypes.object,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func.isRequired,

    /** Icon to display on the left side of component */
    icon: PropTypes.elementType,

    /** Icon Height */
    iconWidth: PropTypes.number,

    /** Icon Height */
    iconHeight: PropTypes.number,

    /** Text to display for the item */
    title: PropTypes.string.isRequired,

    /** Boolean whether to display the right icon */
    shouldShowRightIcon: PropTypes.bool,

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
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    wrapperStyle: {},
    success: false,
    icon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconRight: ArrowRight,
    iconStyles: [],
    iconFill: undefined,
    focused: false,
    disabled: false,
    subtitle: undefined,
};

const MenuItem = ({
    badgeText,
    onPress,
    icon,
    iconRight,
    title,
    shouldShowRightIcon,
    wrapperStyle,
    success,
    iconWidth,
    iconHeight,
    description,
    iconStyles,
    iconFill,
    focused,
    disabled,
    subtitle,
}) => (
    <Pressable
        onPress={(e) => {
            if (disabled) {
                return;
            }

            onPress(e);
        }}
        style={({hovered, pressed}) => ([
            styles.popoverMenuItem,
            getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed, success, disabled)),
            wrapperStyle,
        ])}
    >
        {({hovered, pressed}) => (
            <>
                <View style={styles.flexRow}>
                    {icon && (
                        <View
                            style={[
                                styles.popoverMenuIcon,
                                ...iconStyles,
                            ]}
                        >
                            <Icon
                                src={icon}
                                width={iconWidth}
                                height={iconHeight}
                                fill={iconFill || getIconFillColor(
                                    getButtonState(focused || hovered, pressed, success, disabled),
                                )}
                            />
                        </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer]}>
                        <Text style={[
                            styles.popoverMenuText,
                            styles.ml3,
                            (disabled ? styles.disabledText : undefined),
                        ]}
                        >
                            {title}
                        </Text>
                        {description && (
                            <Text style={[styles.popoverMenuDescription, styles.ml3, styles.mt1]}>
                                {description}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.menuItemTextContainer]}>
                    {badgeText && <Badge text={badgeText} badgeStyles={[styles.alignSelfCenter]} />}
                    {subtitle && (
                        <View style={[styles.justifyContentCenter, styles.mr1]}>
                            <Text
                                style={styles.popoverMenuDescription}
                            >
                                {subtitle}
                            </Text>
                        </View>
                    )}
                    {shouldShowRightIcon && (
                        <View style={styles.popoverMenuIcon}>
                            <Icon
                                src={iconRight}
                                fill={getIconFillColor(getButtonState(focused || hovered, pressed, success, disabled))}
                            />
                        </View>
                    )}
                </View>
            </>
        )}
    </Pressable>
);

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
