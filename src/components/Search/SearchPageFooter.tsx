import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import {useSearchStateContext} from './SearchContext';

function SearchPageFooter() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, areAllMatchingItemsSelected, currentSearchKey, currentSearchHash, shouldShowFooter, footerMetadata} = useSearchStateContext();

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchHash, true);

    const {count, total, currency} = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined};
        }

        const shouldUseClientTotal = selectedTransactionsKeys.length > 0 || !footerMetadata?.count || (selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected);
        const selectedTransactionItems = Object.values(selectedTransactions);
        const resolvedCurrency = footerMetadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency;
        const numberOfExpense = shouldUseClientTotal
            ? selectedTransactionsKeys.reduce((acc, key) => {
                  const item = selectedTransactions[key];
                  if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                      return acc;
                  }
                  return acc + 1;
              }, 0)
            : footerMetadata?.count;
        const resolvedTotal = shouldUseClientTotal ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.groupAmount ?? 0), 0) : footerMetadata?.total;

        return {count: numberOfExpense, total: resolvedTotal, currency: resolvedCurrency};
    }, [areAllMatchingItemsSelected, footerMetadata?.count, footerMetadata?.currency, footerMetadata?.total, selectedTransactions, selectedTransactionsKeys, shouldAllowFooterTotals]);

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);

    if (!shouldShowFooter) {
        return null;
    }

    return (
        <View
            style={[
                shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd,
                styles.borderTop,
                styles.ph5,
                styles.pv3,
                styles.flexRow,
                styles.gap3,
                StyleUtils.getBackgroundColorStyle(theme.appBG),
            ]}
        >
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.expenses')}:`}</Text>
                <Text style={valueTextStyle}>{count}</Text>
            </View>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.totalSpend')}:`}</Text>
                <Text style={valueTextStyle}>{convertToDisplayString(total, currency)}</Text>
            </View>
        </View>
    );
}

export default SearchPageFooter;
