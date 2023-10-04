import React from 'react';
import menuItemPropTypes from './menuItemPropTypes';
import MenuItem from './MenuItem';

const propTypes = menuItemPropTypes;

function MenuItemWithTopDescription(props) {
    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={props.forwardedRef}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
        />
    );
}

MenuItemWithTopDescription.propTypes = propTypes;
MenuItemWithTopDescription.displayName = 'MenuItemWithTopDescription';

export default React.forwardRef((props, ref) => (
    <MenuItemWithTopDescription
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
