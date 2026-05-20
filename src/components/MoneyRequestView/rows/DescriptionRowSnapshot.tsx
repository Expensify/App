import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import useLocalize from '@hooks/useLocalize';
import {getDescription} from '@libs/TransactionUtils';
import type {Transaction} from '@src/types/onyx';

function DescriptionRowSnapshot() {
    const {translate} = useLocalize();
    const descriptionHTML = useSnapshotTransactionField((tx: Transaction) => getDescription(tx));

    if (!descriptionHTML) {
        return null;
    }

    return (
        <FieldRow
            description={translate('common.description')}
            shouldRenderAsHTML
            title={descriptionHTML}
            interactive={false}
            shouldShowRightIcon={false}
            numberOfLinesTitle={0}
        />
    );
}

export default DescriptionRowSnapshot;
