import _ from 'underscore';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import useArrowKeyFocusManager from '../../../hooks/useArrowKeyFocusManager';
import GlobalNavigationMenuItem from './GlobalNavigationMenuItem';

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

const defaultProps = {};

function GlobalNavigationMenuItemList(props) {
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: props.menuItems.length - 1, isActive: props.isVisible});

    const selectItem = (index, onSelected) => {
        onSelected();
        setSelectedItemIndex(index);
    };

    return (
        <View>
            {_.map(props.menuItems, (item, menuIndex) => (
                <GlobalNavigationMenuItem
                    key={item.text}
                    icon={item.icon}
                    iconWidth={item.iconWidth}
                    iconHeight={item.iconHeight}
                    title={item.text}
                    description={item.description}
                    onPress={() => selectItem(menuIndex, item.onSelected)}
                    focused={focusedIndex === menuIndex}
                />
            ))}
        </View>
    );
}

GlobalNavigationMenuItemList.propTypes = propTypes;
GlobalNavigationMenuItemList.defaultProps = defaultProps;
GlobalNavigationMenuItemList.displayName = 'GlobalNavigationMenuItemList';

export default GlobalNavigationMenuItemList;
