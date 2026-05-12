import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import DisplayNames from '@components/DisplayNames';
import useLocalize from '@hooks/useLocalize';
import type {OptionData} from '@libs/ReportUtils';
import {isGroupChat, isSystemChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type TitleProps = {
    optionItem: OptionData;
    displayNameStyle: StyleProp<TextStyle>;
    testID: number;
};

function Title({optionItem, displayNameStyle, testID}: TitleProps) {
    const {translate} = useLocalize();

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
