import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '@styles/styles';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';

import CONST from '@src/CONST';
import Header from '@components/Header';
import {SidebarNavigationContext} from '@pages/home/sidebar/SidebarNavigationContext';
import SubNavigationMenuItem from './SubNavigationMenuItem';

const propTypes = {
    /** Header title for menu */
    title: PropTypes.string.isRequired,

    /** Menu items to be rendered on the list */
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            /** An icon element displayed on the left side */
            icon: PropTypes.elementType,

            /** Text label */
            text: PropTypes.string.isRequired,

            /** A callback triggered when this item is selected */
            onSelected: PropTypes.func.isRequired,
        }),
    ).isRequired,

    /** Custom header more advanced than just text */
    customHeader: PropTypes.element,
    ...withLocalizePropTypes,
};

const defaultProps = {
    customHeader: null,
};

function SubNavigationMenu({isSmallScreenWidth, menuItems, title, customHeader}) {
    const sidebarNavigation = useContext(SidebarNavigationContext);

    if (isSmallScreenWidth) {
        return null;
    }

    return (
        <View style={styles.h100}>
            <View style={styles.sidebarHeaderContainer}>
                {customHeader || (
                    <Header
                        title={<Text style={styles.textHeadline}>{title}</Text>}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        shouldShowEnvironmentBadge
                    />
                )}
            </View>
            <View style={{}}>
                {_.map(menuItems, (item) => (
                    <SubNavigationMenuItem
                        key={item.value}
                        icon={item.icon}
                        title={item.text}
                        onPress={() => item.onSelected(item.value)}
                        isFocused={sidebarNavigation.selectedSubNavigationOption === item.value}
                    />
                ))}
            </View>
        </View>
    );
}

SubNavigationMenu.propTypes = propTypes;
SubNavigationMenu.defaultProps = defaultProps;
SubNavigationMenu.displayName = 'SubNavigation';

export default withLocalize(SubNavigationMenu);
