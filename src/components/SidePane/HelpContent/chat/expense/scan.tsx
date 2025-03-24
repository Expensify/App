/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function ScanExpense({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Scanned</Text>
            <Text style={styles.textNormal}>A "scanned" expense was created by extracting the relevant details using the Concierge AI. </Text>
        </>
    );
}

export default ScanExpense;
