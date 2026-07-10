import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {markRejectViolationAsResolved} from '@userActions/IOU/RejectMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type {SimpleActionProps} from './types';

import useTransactionThreadData from './useTransactionThreadData';

function MarkAsResolvedPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {transaction, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transaction?.transactionID)}`);

    const {isOffline} = useNetwork();

    return (
        <Button
            success
            onPress={() => {
                if (!transaction?.transactionID) {
                    return;
                }
                markRejectViolationAsResolved(transaction.transactionID, isOffline, transactionViolations, transactionThreadReport?.reportID);
            }}
            text={translate('iou.reject.markAsResolved')}
        />
    );
}

export default MarkAsResolvedPrimaryAction;
