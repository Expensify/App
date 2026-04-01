import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import {markRejectViolationAsResolved} from '@userActions/IOU';
import type {SimpleActionProps} from './types';
import useTransactionThreadData from './useTransactionThreadData';

function MarkAsResolvedPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {transaction, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);

    return (
        <Button
            success
            onPress={() => {
                if (!transaction?.transactionID) {
                    return;
                }
                markRejectViolationAsResolved(transaction.transactionID, transactionThreadReport?.reportID);
            }}
            text={translate('iou.reject.markAsResolved')}
        />
    );
}

export default MarkAsResolvedPrimaryAction;
