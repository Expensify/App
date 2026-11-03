import DisplayNames from '@components/DisplayNames';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {shouldUseBoldText, shouldUseFullTitleForOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isGroupChat} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';

type TitleProps = {
    /** Option data for the row. Source of `text`, `displayNamesWithTooltips`, chat-type flags, parse-mode hints, and unread/bold derivation. */
    optionItem: OptionData;

    /** Numeric testID for the title node. This is the FlashList row index passed in from the renderItem callback, not the report ID. */
    testID: number;
};

function Title({optionItem, testID}: TitleProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const textUnreadStyle = shouldUseBoldText(optionItem) ? [styles.sidebarLinkText, styles.sidebarLinkTextBold] : [styles.sidebarLinkText];
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0];

    const shouldParseFullTitle = optionItem?.parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat(optionItem);
    const shouldUseFullTitle = shouldUseFullTitleForOption(optionItem);

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
