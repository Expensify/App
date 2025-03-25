/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function ManualExpense({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Manual</Text>
            <Text style={styles.textNormal}>
                A "manual" expense has had all its details specified by the workspace member. It was not imported from any system, or scanned from a receipt.
            </Text>
        </>
    );
}

export default ManualExpense;
