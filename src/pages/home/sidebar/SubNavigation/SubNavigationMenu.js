import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import SubNavigationMenuItem from './SubNavigationMenuItem';

import CONST from '../../../../CONST';
import Header from '../../../../components/Header';
import {SidebarNavigationContext} from '../SidebarNavigationContext';

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

function SubNavigation({isSmallScreenWidth, menuItems, title, customHeader}) {
    const sidebarNavigation = useContext(SidebarNavigationContext);

    if (isSmallScreenWidth) {
        return null;
    }

    return (
        <View style={styles.h100}>
            <View style={styles.sidebarHeaderContainer}>
                {customHeader ? (
                    customHeader
                ) : (
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

SubNavigation.propTypes = propTypes;
SubNavigation.displayName = 'SubNavigation';

export default withLocalize(SubNavigation);
