import _ from 'underscore';
import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import GlobalNavigationMenuItem from './GlobalNavigationMenuItem';
import {SidebarNavigationContext} from '../SidebarNavigationContext';

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
};

function GlobalNavigationMenuItemList(props) {
    const sidebarNavigation = useContext(SidebarNavigationContext);

    const selectItem = (value, onSelected) => {
        onSelected(value);
    };

    return (
        <View>
            {_.map(props.menuItems, (item) => (
                <GlobalNavigationMenuItem
                    key={item.text}
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
GlobalNavigationMenuItemList.displayName = 'GlobalNavigationMenuItemList';

export default GlobalNavigationMenuItemList;
