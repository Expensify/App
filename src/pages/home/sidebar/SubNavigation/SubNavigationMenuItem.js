import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '@components/Text';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import Icon from '@components/Icon';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

const propTypes = {
    /** Icon to display */
    icon: PropTypes.elementType,

    /** Text to display for the item */
    title: PropTypes.string,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func,

    /** Whether item is focused or active */
    isFocused: PropTypes.bool,
};

const defaultProps = {
    icon: undefined,
    isFocused: false,
    onPress: () => {},
    title: '',
};

const SubNavigationMenuItem = React.forwardRef(({icon, title, isFocused, onPress}, ref) => (
    <PressableWithFeedback
        onPress={() => !isFocused && onPress()}
        ref={ref}
        accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
        accessibilityLabel={title}
    >
        {({pressed, hovered}) => (
            <View style={[styles.subNavigationOption, hovered ? styles.sidebarLinkHoverLHN : null, isFocused ? styles.sidebarLinkActiveLHN : null]}>
                <Icon
                    additionalStyles={[styles.subNavigationMenuIcon]}
                    pressed={pressed}
                    src={icon}
                    fill={isFocused ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.DEFAULT, true) : StyleUtils.getIconFillColor()}
                />
                <Text style={[StyleUtils.getFontSizeStyle(variables.fontSizeNormal), styles.subNavigationMenuItem, styles.textAlignCenter]}>{title}</Text>
            </View>
        )}
    </PressableWithFeedback>
));

SubNavigationMenuItem.propTypes = propTypes;
SubNavigationMenuItem.defaultProps = defaultProps;
SubNavigationMenuItem.displayName = 'SubNavigationMenuItem';

export default SubNavigationMenuItem;
