import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

type MenuItemDescriptionProps = {
    /** Text to render as the description */
    children: string | number;

    /** Maximum number of lines to render before the text is truncated */
    numberOfLines?: number;

    /**
     * Which text size to render at.
     *
     * - `supporting` (default) — the small line that sits under a `Title`.
     * - `standalone` — the larger size used when the description is the row's only text, e.g. an
     *   unfilled field row whose description doubles as the field's placeholder.
     */
    variant?: 'supporting' | 'standalone';
};

/** The supporting text block of a `MenuItem.Content` */
function MenuItemDescription({children, numberOfLines = 2, variant = 'supporting'}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    useMenuItemAccessibilityLabel('description', String(children));

    const isStandalone = variant === 'standalone';

    return (
        <Text
            style={[
                styles.textLabelSupporting,
                isStandalone && StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
                isStandalone ? StyleUtils.getLineHeightStyle(variables.fontSizeNormalHeight) : styles.textLineHeightNormal,
                styles.breakWord,
            ]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

export default MenuItemDescription;
