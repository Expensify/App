/** Row of a flagged expense: its receipt, merchant and amount, with its violations next to the date. */
import DateCell from '@components/Search/SearchList/ListItem/DateCell';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import Text from '@components/Text';
import ReceiptCell from '@components/TransactionItemRow/DataCells/ReceiptCell';
import TransactionItemRowNarrowSubtitle from '@components/TransactionItemRow/TransactionItemRowNarrowSubtitle';
import TransactionItemRowNarrowTextColumn from '@components/TransactionItemRow/TransactionItemRowNarrowTextColumn';
import TransactionItemRowNarrowTitle from '@components/TransactionItemRow/TransactionItemRowNarrowTitle';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCreated, getDescription, getMerchantName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type InsightsFlaggedExpenseRowProps = {
    expense: TransactionListItemType;

    /** Labels of the expense's violations, in the order they're listed */
    violations: string[];
};

function InsightsFlaggedExpenseRow({expense, violations}: InsightsFlaggedExpenseRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const merchant = getMerchantName(expense, translate);

    return (
        <View style={styles.flexRow}>
            <ReceiptCell
                transactionItem={expense}
                isSelected={false}
                style={styles.mr3}
                shouldUseNarrowLayout
            />
            <TransactionItemRowNarrowTextColumn>
                <TransactionItemRowNarrowTitle
                    transactionItem={expense}
                    report={expense.report}
                    policy={expense.policy}
                    merchant={merchant}
                    merchantOrDescription={merchant || getDescription(expense)}
                    shouldShowTooltip
                />
                <TransactionItemRowNarrowSubtitle>
                    <Text
                        variant="label"
                        numberOfLines={1}
                        style={[styles.flex1, styles.textSupporting]}
                    >
                        {violations.join(` ${CONST.DOT_SEPARATOR} `)}
                    </Text>
                    <DateCell
                        date={getCreated(expense)}
                        showTooltip
                        isLargeScreenWidth={false}
                    />
                </TransactionItemRowNarrowSubtitle>
            </TransactionItemRowNarrowTextColumn>
        </View>
    );
}

export default InsightsFlaggedExpenseRow;
