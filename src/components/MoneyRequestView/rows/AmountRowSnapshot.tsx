import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import type {Transaction} from '@src/types/onyx';

function AmountRowSnapshot() {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const amount = useSnapshotTransactionField((tx: Transaction) => tx.amount);
    const currency = useSnapshotTransactionField((tx: Transaction) => tx.currency);
    const title = convertToDisplayString(amount, currency)?.toString() ?? '';
    const description = `${translate('iou.amount')}`;

    return (
        <FieldRow
            title={title}
            description={description}
            interactive={false}
            shouldShowRightIcon={false}
            numberOfLinesTitle={2}
        />
    );
}

export default AmountRowSnapshot;
