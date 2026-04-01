import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import type {SimpleActionProps} from './types';
import useTransactionThreadData from './useTransactionThreadData';

function MarkAsCashPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {requestParentReportAction, iouTransactionID, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);
    const transactionViolations = useTransactionViolations(iouTransactionID);

    return (
        <Button
            success
            text={translate('iou.markAsCash')}
            onPress={() => {
                if (!requestParentReportAction || !iouTransactionID || !transactionThreadReport?.reportID) {
                    return;
                }
                markAsCashAction(iouTransactionID, transactionThreadReport.reportID, transactionViolations);
            }}
        />
    );
}

export default MarkAsCashPrimaryAction;
