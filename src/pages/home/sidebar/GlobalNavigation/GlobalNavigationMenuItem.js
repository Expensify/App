import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import * as StyleUtils from '../../../../styles/StyleUtils';
import Icon from '../../../../components/Icon';
import CONST from '../../../../CONST';
import Hoverable from '../../../../components/Hoverable';
import variables from '../../../../styles/variables';
import defaultTheme from '../../../../styles/themes/default';
import fontWeightBold from '../../../../styles/fontWeight/bold';
import PressableWithFeedback from '../../../../components/Pressable/PressableWithFeedback';

const propTypes = {
    /** Icon to display */
    icon: PropTypes.elementType,

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Text to display for the item */
    title: PropTypes.string,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func,

    /** Whether item is focused or active */
    focused: PropTypes.bool,
};

const defaultProps = {
    icon: undefined,
    iconFill: undefined,
    focused: false,
    onPress: () => {},
    title: '',
};

const GlobalNavigationMenuItem = React.forwardRef(({icon, iconFill, title, focused, onPress}, ref) => (
    <Hoverable>
        {(isHovered) => (
            <PressableWithFeedback
                onPress={() => focused && onPress()}
                style={styles.globalNavigationItemContainer}
                ref={ref}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                accessibilityLabel={title ? title.toString() : ''}
            >
                {({pressed}) => (
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1]}>
                        <View style={[styles.globalNavigationSelectionIndicator, {backgroundColor: focused ? defaultTheme.iconMenu : defaultTheme.transparent}]} />
                        <View style={[styles.flexColumn, styles.flex1, styles.alignItemsCenter, styles.mr1]}>
                            <View style={styles.popoverMenuIcon}>
                                <Icon
                                    hovered={isHovered}
                                    pressed={pressed}
                                    src={icon}
                                    fill={focused ? defaultTheme.iconMenu : iconFill}
                                />
                            </View>
                            <View style={[styles.mt1, styles.alignItemsCenter]}>
                                <Text
                                    style={[
                                        StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall),
                                        focused ? {color: defaultTheme.textLight, fontWeight: fontWeightBold} : {color: iconFill},
                                    ]}
                                >
                                    {title}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </PressableWithFeedback>
        )}
    </Hoverable>
));

GlobalNavigationMenuItem.propTypes = propTypes;
GlobalNavigationMenuItem.defaultProps = defaultProps;
GlobalNavigationMenuItem.displayName = 'GlobalNavigationMenuItem';

export default GlobalNavigationMenuItem;
