import FormHelpMessage from '@components/FormHelpMessage';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';

type MenuItemHelpTextProps = {
    /** Error or hint text to render under the row. Nothing renders when it is empty */
    message?: string | ReactNode;

    /** Whether the text reads as an error (red) instead of a hint (muted) */
    isError?: boolean;
};

/** The trailing help line of a `MenuItem.Root`, rendered under `MenuItem.Row` and inside the row's press target */
function MenuItemHelpText({message, isError = false}: MenuItemHelpTextProps) {
    const styles = useThemeStyles();

    return (
        <FormHelpMessage
            isError={isError}
            shouldShowRedDotIndicator={false}
            message={message}
            style={styles.menuItemError}
        />
    );
}

export default MenuItemHelpText;
