import React from 'react';
import {View} from 'react-native';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import type {Transaction} from '@src/types/onyx';
import ReceiptDisplay from './ReceiptDisplay';

function ReceiptCardSnapshot() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const transaction = useSnapshotTransactionField((tx: Transaction) => tx);
    const hasReceipt = hasReceiptTransactionUtils(transaction);

    if (!hasReceipt) {
        return null;
    }

    const receiptURIs = getThumbnailAndImageURIs(transaction);
    const receiptStyle = shouldUseNarrowLayout ? styles.expenseViewImageSmall : styles.expenseViewImage;

    return (
        <View style={styles.pRelative}>
            <ReceiptDisplay
                transaction={transaction}
                receiptURIs={receiptURIs}
                receiptStyle={receiptStyle}
                fillSpace={false}
                showBorderlessLoading={false}
                isReceiptOfflinePending={false}
                readonly
                canEditReceipt={false}
                onLoad={() => {}}
                onLoadFailure={() => {}}
                auditMessages={[]}
                shouldShowAuditMessages={false}
            />
        </View>
    );
}

export default ReceiptCardSnapshot;
