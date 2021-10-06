import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import MenuItemPropTypes from './MenuItemPropTypes';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(MenuItemPropTypes)),
};
const defaultProps = {
    menuItems: [],
};

const MenuItemList = ({menuItems}) => (
    <>
        {_.map(menuItems, menuItemProps => (
            <MenuItem
                key={_.uniqueId(menuItemProps.title)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...menuItemProps}
            />
        ))}
    </>
);

MenuItemList.displayName = 'MenuItemList';
MenuItemList.propTypes = propTypes;
MenuItemList.defaultProps = defaultProps;

export default MenuItemList;
