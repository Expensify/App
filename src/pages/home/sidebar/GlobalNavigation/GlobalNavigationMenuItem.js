import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import * as StyleUtils from '../../../../styles/StyleUtils';
import Icon from '../../../../components/Icon';
import CONST from '../../../../CONST';
import PressableWithSecondaryInteraction from '../../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../../components/Hoverable';
import variables from '../../../../styles/variables';
import stylePropTypes from '../../../../styles/stylePropTypes';
import defaultTheme from '../../../../styles/themes/default';
import fontWeightBold from '../../../../styles/fontWeight/bold';

const propTypes = {
    /** Function to fire when component is pressed */
    onPress: PropTypes.func,

    /** Icon to display */
    icon: PropTypes.elementType,

    /** Icon Width */
    iconWidth: PropTypes.number,

    /** Icon Height */
    iconHeight: PropTypes.number,

    /** Text to display for the item */
    title: PropTypes.string,

    /** Any additional styles to pass to the icon container. */
    iconStyles: stylePropTypes,

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Whether item is focused or active */
    focused: PropTypes.bool,

    /** Prop to represent the size of the avatar images to be shown */
    avatarSize: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),
};

const defaultProps = {
    icon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    iconStyles: [],
    iconFill: undefined,
    focused: false,
    onPress: () => {},
    title: '',
    avatarSize: CONST.AVATAR_SIZE.DEFAULT,
};

const GlobalNavigationMenuItem = React.forwardRef((props, ref) => (
    <Hoverable>
        {(isHovered) => (
            <PressableWithSecondaryInteraction
                onPress={props.focused ? () => {} : props.onPress}
                style={styles.globalNavigationItemContainer}
                ref={ref}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                accessibilityLabel={props.title ? props.title.toString() : ''}
            >
                {({pressed}) => (
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1]}>
                        <View style={[styles.globalNavigationSelectionIndicator, {backgroundColor: props.focused ? defaultTheme.iconMenu : defaultTheme.transparent}]} />
                        <View style={[styles.flexColumn, styles.flex1, styles.alignItemsCenter, styles.mr1]}>
                            <View style={[styles.popoverMenuIcon, ...props.iconStyles, StyleUtils.getAvatarWidthStyle(props.avatarSize)]}>
                                <Icon
                                    hovered={isHovered}
                                    pressed={pressed}
                                    src={props.icon}
                                    width={props.iconWidth}
                                    height={props.iconHeight}
                                    fill={props.focused ? defaultTheme.iconMenu : props.iconFill}
                                />
                            </View>
                            <View style={[styles.mt1, styles.alignItemsCenter]}>
                                <Text
                                    style={[
                                        StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall),
                                        props.focused ? {color: defaultTheme.textLight, fontWeight: fontWeightBold} : {color: props.iconFill},
                                    ]}
                                >
                                    {props.title}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </PressableWithSecondaryInteraction>
        )}
    </Hoverable>
));

GlobalNavigationMenuItem.propTypes = propTypes;
GlobalNavigationMenuItem.defaultProps = defaultProps;
GlobalNavigationMenuItem.displayName = 'GlobalNavigationMenuItem';

export default GlobalNavigationMenuItem;
