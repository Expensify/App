import _ from 'underscore';
import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import GlobalNavigationMenuItem from './GlobalNavigationMenuItem';
import {SidebarNavigationContext} from '../SidebarNavigationContext';
import defaultTheme from '../../../../styles/themes/default';

const propTypes = {
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

    /* Styles for the menu items list */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: {},
};

function GlobalNavigationMenuItemList(props) {
    const sidebarNavigation = useContext(SidebarNavigationContext);

    const selectItem = (value, onSelected) => {
        onSelected(value);
    };

    return (
        <View style={props.style}>
            {_.map(props.menuItems, (item) => (
                <GlobalNavigationMenuItem
                    key={item.text}
                    iconFill={defaultTheme.icon}
                    icon={item.icon}
                    iconWidth={item.iconWidth}
                    iconHeight={item.iconHeight}
                    title={item.text}
                    description={item.description}
                    onPress={() => selectItem(item.value, item.onSelected)}
                    focused={sidebarNavigation.selectedGlobalNavigationOption === item.value}
                />
            ))}
        </View>
    );
}

GlobalNavigationMenuItemList.propTypes = propTypes;
GlobalNavigationMenuItemList.defaultProps = defaultProps;
GlobalNavigationMenuItemList.displayName = 'GlobalNavigationMenuItemList';

export default GlobalNavigationMenuItemList;
