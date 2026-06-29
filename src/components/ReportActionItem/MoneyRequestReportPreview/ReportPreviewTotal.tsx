import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMoneyRequestSpendBreakdown} from '@libs/ReportUtils';
import {useReportPreviewData, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';

/**
 * Renders the total amount of a multi-expense report preview. Reads the report subject from context and derives the
 * total itself, so the shell does not drill amount data down.
 */
function ReportPreviewTotal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {iouReport, transactions} = useReportPreviewData();
    const {shouldShowAccessPlaceHolder} = useReportPreviewUIState();
    const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(iouReport);

    if (transactions.length <= 1 || shouldShowAccessPlaceHolder) {
        return null;
    }

    return (
        <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.justifyContentBetween : styles.gap2, styles.alignItemsCenter]}>
            <Text
                style={[styles.textLabelSupporting]}
                numberOfLines={1}
            >
                {translate('common.total')}
            </Text>
            <Text style={[styles.headerText]}>{convertToDisplayString(totalDisplaySpend, iouReport?.currency)}</Text>
        </View>
    );
}

export default ReportPreviewTotal;
