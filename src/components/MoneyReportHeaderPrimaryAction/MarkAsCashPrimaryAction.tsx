import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useTransactionViolations from '@hooks/useTransactionViolations';

import {markAsCash as markAsCashAction} from '@userActions/Transaction';

import React from 'react';

import type {SimpleActionProps} from './types';

import useTransactionThreadData from './useTransactionThreadData';

function MarkAsCashPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {requestParentReportAction, iouTransactionID, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);
    const transactionViolations = useTransactionViolations(iouTransactionID);

    return (
        <Button
            variant="success"
            onPress={() => {
                if (!requestParentReportAction || !iouTransactionID || !transactionThreadReport?.reportID) {
                    return;
                }
                markAsCashAction(iouTransactionID, transactionThreadReport.reportID, transactionViolations);
            }}
        >
            <Button.Text>{translate('iou.markAsCash')}</Button.Text>
        </Button>
    );
}

export default MarkAsCashPrimaryAction;
