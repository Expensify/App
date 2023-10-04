import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import * as StyleUtils from '../../../../styles/StyleUtils';
import Icon from '../../../../components/Icon';
import CONST from '../../../../CONST';
import variables from '../../../../styles/variables';
import defaultTheme from '../../../../styles/themes/default';
import PressableWithFeedback from '../../../../components/Pressable/PressableWithFeedback';
import refPropTypes from '../../../../components/refPropTypes';

const propTypes = {
    /** Icon to display */
    icon: PropTypes.elementType,

    /** Text to display for the item */
    title: PropTypes.string,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func,

    /** A ref to forward to PressableWithFeedback */
    forwardedRef: refPropTypes,

    /** Whether item is focused or active */
    isFocused: PropTypes.bool,
};

const defaultProps = {
    icon: undefined,
    isFocused: false,
    onPress: () => {},
    title: '',
    forwardedRef: null,
};

function GlobalNavigationMenuItem({icon, title, isFocused, onPress, forwardedRef}) {
    return (
        <PressableWithFeedback
            onPress={() => !isFocused && onPress()}
            style={styles.globalNavigationItemContainer}
            ref={forwardedRef}
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
                            fill={isFocused ? defaultTheme.iconMenu : defaultTheme.icon}
                        />
                        <View style={[styles.mt1, styles.alignItemsCenter]}>
                            <Text style={[StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall), styles.globalNavigationMenuItem(isFocused)]}>{title}</Text>
                        </View>
                    </View>
                </View>
            )}
        </PressableWithFeedback>
    );
}

GlobalNavigationMenuItem.propTypes = propTypes;
GlobalNavigationMenuItem.defaultProps = defaultProps;
GlobalNavigationMenuItem.displayName = 'GlobalNavigationMenuItem';

export default React.forwardRef((props, ref) => (
    <GlobalNavigationMenuItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
