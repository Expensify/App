import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {markRejectViolationAsResolved} from '@userActions/IOU/RejectMoneyRequest';

import CONST from '@src/CONST';
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
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => {
                if (!transaction?.transactionID) {
                    return;
                }
                markRejectViolationAsResolved(transaction.transactionID, isOffline, transactionViolations, transactionThreadReport?.reportID);
            }}
        >
            <Button.Text>{translate('iou.reject.markAsResolved')}</Button.Text>
        </Button>
    );
}

export default MarkAsResolvedPrimaryAction;
