import React from 'react';
import DisplayNames from '@components/DisplayNames';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldUseBoldText} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isGroupChat, isSystemChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type TitleProps = {
    /** Option data for the row. Source of `text`, `displayNamesWithTooltips`, chat-type flags, parse-mode hints, and unread/bold derivation. */
    optionItem: OptionData;

    /** Whether the row is the currently focused/active option. Drives the active text style. */
    isOptionFocused: boolean;

    /** Numeric testID for the title node. This is the FlashList row index passed in from the renderItem callback, not the report ID. */
    testID: number;
};

function Title({optionItem, isOptionFocused, testID}: TitleProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = shouldUseBoldText(optionItem) ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0];

    const shouldParseFullTitle = optionItem?.parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat(optionItem);
    const shouldUseFullTitle =
        !!optionItem.isChatRoom ||
        !!optionItem.isPolicyExpenseChat ||
        !!optionItem.isTaskReport ||
        !!optionItem.isThread ||
        !!optionItem.isMoneyRequestReport ||
        !!optionItem.isInvoiceReport ||
        !!optionItem.private_isArchived ||
        isGroupChat(optionItem) ||
        isSystemChat(optionItem);

    return (
        <DisplayNames
            accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
            fullTitle={optionItem.text ?? ''}
            shouldParseFullTitle={shouldParseFullTitle}
            displayNamesWithTooltips={optionItem.displayNamesWithTooltips ?? []}
            tooltipEnabled
            numberOfLines={1}
            textStyles={displayNameStyle}
            shouldUseFullTitle={shouldUseFullTitle}
            testID={testID}
        />
    );
}

Title.displayName = 'OptionRow.Title';

export default Title;
