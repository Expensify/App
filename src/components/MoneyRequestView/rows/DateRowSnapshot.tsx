import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import useLocalize from '@hooks/useLocalize';
import {getFormattedCreated} from '@libs/TransactionUtils';
import type {Transaction} from '@src/types/onyx';

function DateRowSnapshot() {
    const {translate} = useLocalize();
    const transaction = useSnapshotTransactionField((tx: Transaction) => tx);
    const transactionDate = getFormattedCreated(transaction);

    return (
        <FieldRow
            description={translate('common.date')}
            title={transactionDate}
            numberOfLinesTitle={2}
            interactive={false}
            shouldShowRightIcon={false}
        />
    );
}

export default DateRowSnapshot;
