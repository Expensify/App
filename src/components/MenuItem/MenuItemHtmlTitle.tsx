import Text from '@components/Text';

import {useMentionedAccountIDToNameMap} from '@hooks/useAccountIDToNameMap';
import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';
import Parser from '@libs/Parser';

type MenuItemHtmlTitleProps = {
    processedTitle: string;
};

/**
 * Thin wrapper that owns the useMentionedAccountIDToNameMap hook so that only
 * MenuItems with an HTML title pay the PERSONAL_DETAILS_LIST subscription cost.
 */
function MenuItemHtmlTitle({processedTitle}: MenuItemHtmlTitleProps) {
    const styles = useThemeStyles();
    const accountIDToName = useMentionedAccountIDToNameMap(processedTitle || undefined);

    return <Text style={styles.webViewStyles.baseFontStyle}>{convertToLTR(Parser.htmlToText(processedTitle, {accountIDToName}))}</Text>;
}

MenuItemHtmlTitle.displayName = 'MenuItemHtmlTitle';

export default MenuItemHtmlTitle;
