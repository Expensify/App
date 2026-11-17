import RenderHTML from '@components/RenderHTML';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemHelpTextHTMLProps} from './types';

import BaseMenuItemHelpText from './BaseMenuItemHelpText';

/**
 * An error or hint given as HTML, rendered after a `MenuItem.Root` so its links stay pressable
 * on their own instead of being swallowed by the row's press target.
 */
function MenuItemHelpTextHTML({children, isError = false}: MenuItemHelpTextHTMLProps) {
    const styles = useThemeStyles();
    const textTag = isError ? 'alert-text' : 'muted-text-label';

    return (
        <BaseMenuItemHelpText
            isError={isError}
            style={[styles.mt0, styles.mb0, styles.ph5, styles.pb5]}
        >
            <RenderHTML html={`<comment><${textTag}>${children}</${textTag}></comment>`} />
        </BaseMenuItemHelpText>
    );
}

export default MenuItemHelpTextHTML;
