import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import {markRejectViolationAsResolved} from '@userActions/IOU/RejectMoneyRequest';
import type {SimpleActionProps} from './types';
import useTransactionThreadData from './useTransactionThreadData';

function MarkAsResolvedPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {transaction, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);

    const {isOffline} = useNetwork();

    return (
        <Button
            success
            onPress={() => {
                if (!transaction?.transactionID) {
                    return;
                }
                markRejectViolationAsResolved(transaction.transactionID, isOffline, transactionThreadReport?.reportID);
            }}
            text={translate('iou.reject.markAsResolved')}
        />
    );
}

export default MarkAsResolvedPrimaryAction;
