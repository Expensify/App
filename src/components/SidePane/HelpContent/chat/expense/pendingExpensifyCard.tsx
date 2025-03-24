/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function ExpensifyCardPendingExpense({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Expensify Card (pending)</Text>
            <Text style={styles.textNormal}>
                A "pending" Expensify Card expense represents a purchase that was recently made on the card, but has not yet "posted" – meaning, it has not been formally recognized as a
                final, complete transaction.
            </Text>
            <Text style={[styles.textNormal, styles.pt3]}>Any changes made to this expense will be preserved when the expense posts, typically 2-7 days later.</Text>
            <Text style={[styles.textNormal, styles.pt3]}>Pending transactions cannot be approved, as the final expense amount will not be confirmed until it posts.</Text>
        </>
    );
}

export default ExpensifyCardPendingExpense;
