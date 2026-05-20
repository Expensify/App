import React from 'react';
import type {Transaction} from '@src/types/onyx';
import SnapshotTransactionProvider from './contexts/SnapshotTransactionProvider';

type MoneyRequestViewPreviewProps = {
    source: Transaction;
    policyID: string | undefined;
    children: React.ReactNode;
};

function MoneyRequestViewPreview({source, policyID, children}: MoneyRequestViewPreviewProps) {
    return (
        <SnapshotTransactionProvider
            source={source}
            policyID={policyID}
        >
            {children}
        </SnapshotTransactionProvider>
    );
}

export default MoneyRequestViewPreview;
