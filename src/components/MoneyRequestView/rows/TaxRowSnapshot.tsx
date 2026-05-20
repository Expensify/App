import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import type {Transaction} from '@src/types/onyx';

function TaxRowSnapshot() {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const taxName = useSnapshotTransactionField((tx: Transaction) => tx?.taxName);
    const taxAmount = useSnapshotTransactionField((tx: Transaction) => tx?.taxAmount);
    const currency = useSnapshotTransactionField((tx: Transaction) => tx?.currency);

    if (!taxName && !taxAmount) {
        return null;
    }

    const taxAmountTitle = taxAmount !== undefined ? (convertToDisplayString(Math.abs(taxAmount), currency)?.toString() ?? '') : '';

    return (
        <>
            {!!taxName && (
                <FieldRow
                    description={translate('common.tax')}
                    title={taxName}
                    numberOfLinesTitle={2}
                    interactive={false}
                    shouldShowRightIcon={false}
                />
            )}
            {!!taxAmountTitle && (
                <FieldRow
                    description={translate('iou.taxAmount')}
                    title={taxAmountTitle}
                    numberOfLinesTitle={2}
                    interactive={false}
                    shouldShowRightIcon={false}
                />
            )}
        </>
    );
}

export default TaxRowSnapshot;
