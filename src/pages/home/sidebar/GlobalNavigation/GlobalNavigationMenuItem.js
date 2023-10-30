import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

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

const GlobalNavigationMenuItem = React.forwardRef(({icon, title, isFocused, onPress}, ref) => (
    <PressableWithFeedback
        onPress={() => !isFocused && onPress()}
        style={styles.globalNavigationItemContainer}
        ref={ref}
        accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
        accessibilityLabel={title}
    >
        {({pressed}) => (
            <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1]}>
                <View style={styles.globalNavigationSelectionIndicator(isFocused)} />
                <View style={[styles.flexColumn, styles.flex1, styles.alignItemsCenter, styles.mr1]}>
                    <Icon
                        additionalStyles={[styles.popoverMenuIcon]}
                        pressed={pressed}
                        src={icon}
                        fill={isFocused ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.DEFAULT, true) : StyleUtils.getIconFillColor()}
                    />
                    <View style={[styles.mt1, styles.alignItemsCenter]}>
                        <Text style={[StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall), styles.globalNavigationMenuItem(isFocused)]}>{title}</Text>
                    </View>
                </View>
            </View>
        )}
    </PressableWithFeedback>
));

GlobalNavigationMenuItem.propTypes = propTypes;
GlobalNavigationMenuItem.defaultProps = defaultProps;
GlobalNavigationMenuItem.displayName = 'GlobalNavigationMenuItem';

export default GlobalNavigationMenuItem;
