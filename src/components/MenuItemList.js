import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import menuItemPropTypes from './menuItemPropTypes';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)),
};
const defaultProps = {
    menuItems: [],
};

const MenuItemList = props => (
    <>
        {_.map(props.menuItems, menuItemProps => (
            <MenuItem
                key={menuItemProps.title}
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
