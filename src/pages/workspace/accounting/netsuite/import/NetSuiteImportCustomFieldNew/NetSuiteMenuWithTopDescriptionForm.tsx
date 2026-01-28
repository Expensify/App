import React from 'react';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

type NetSuiteMenuWithTopDescriptionFormProps = MenuItemProps & {
    /** The value of the menu item */
    value?: string;

    /** Callback to format the value */
    valueRenderer?: (value?: string) => string | undefined;
};

function NetSuiteMenuWithTopDescriptionForm({value, valueRenderer, ...props}: NetSuiteMenuWithTopDescriptionFormProps) {
    return (
        <MenuItemWithTopDescription
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            title={valueRenderer ? valueRenderer(value) : value}
        />
    );
}

export default NetSuiteMenuWithTopDescriptionForm;
