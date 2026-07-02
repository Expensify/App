import React from 'react';
import Button from '@components/ButtonComposed';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';

import {markRejectViolationAsResolved} from '@userActions/IOU/RejectMoneyRequest';

import React from 'react';

import type {SimpleActionProps} from './types';

import useTransactionThreadData from './useTransactionThreadData';

function MarkAsResolvedPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {transaction, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);

    const {isOffline} = useNetwork();

    return (
        <Button
            variant="success"
            onPress={() => {
                if (!transaction?.transactionID) {
                    return;
                }
                markRejectViolationAsResolved(transaction.transactionID, isOffline, transactionThreadReport?.reportID);
            }}
        >
            <Button.Text>{translate('iou.reject.markAsResolved')}</Button.Text>
        </Button>
    );
}

export default MarkAsResolvedPrimaryAction;
