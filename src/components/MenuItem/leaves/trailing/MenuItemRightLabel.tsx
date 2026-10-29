import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type MenuItemRightLabelProps = {
    /** Text to render as the label */
    children: string;
};

/** A short trailing hint of a `MenuItem.Row`, such as a `Required` marker */
function MenuItemRightLabel({children}: MenuItemRightLabelProps) {
    const styles = useThemeStyles();

    return <Text style={styles.rightLabelMenuItem}>{children}</Text>;
}

export default MenuItemRightLabel;
