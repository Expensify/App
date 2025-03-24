/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function ExpensifyCardExpense({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Expensify Card</Text>
            <Text style={styles.textNormal}>An "Expensify Card" expense corresponds to a "posted" (meaning, finalized by the bank) purchase.</Text>
            <Text style={[styles.textNormal, styles.pt3]}>Expensify Card expenses cannot be reimbursed as they are centrally paid by the bank account linked to the workspace.</Text>
        </>
    );
}

export default ExpensifyCardExpense;
