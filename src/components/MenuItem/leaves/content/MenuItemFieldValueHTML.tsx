import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';
import Parser from '@libs/Parser';

import React from 'react';
import {View} from 'react-native';

type MenuItemFieldValueHTMLProps = {
    /** HTML the field holds. Markdown has to be turned into HTML by the caller first, e.g. with `Parser.replace` */
    children: string;

    /** Cuts the rendered text down to this many characters, closing any tags left open */
    characterLimit?: number;
};

/**
 * Value a field holds, given as HTML. A value with no markup renders as plain text, with its entities decoded,
 * so it is safe to pass values that are only sometimes HTML.
 */
function MenuItemFieldValueHTML({children, characterLimit}: MenuItemFieldValueHTMLProps) {
    const styles = useThemeStyles();

    // The row builds its label from text, so screen readers hear the content rather than the markup
    useMenuItemAccessibilityLabel('bottom', Parser.htmlToText(children));

    // Truncation needs the value wrapped in a tag, since truncateHTML returns nothing for markup-free input
    const wrappedHTML = `<comment>${children}</comment>`;
    const html = characterLimit ? Parser.truncateHTML(wrappedHTML, characterLimit, {ellipsis: '...'}) : wrappedHTML;

    return (
        <View style={[styles.renderHTMLTitle, styles.textAlignLeft]}>
            {Parser.isHTML(children) ? <RenderHTML html={html} /> : <Text style={styles.webViewStyles.baseFontStyle}>{convertToLTR(Parser.htmlToText(html))}</Text>}
        </View>
    );
}

export default MenuItemFieldValueHTML;
