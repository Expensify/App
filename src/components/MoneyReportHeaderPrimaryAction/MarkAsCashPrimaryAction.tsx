import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useTransactionViolations from '@hooks/useTransactionViolations';

import {markAsCash as markAsCashAction} from '@userActions/Transaction';

import CONST from '@src/CONST';

import React from 'react';

import type {SimpleActionProps} from './types';

import useTransactionThreadData from './useTransactionThreadData';

function MarkAsCashPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {requestParentReportAction, iouTransactionID, transactionThreadReport} = useTransactionThreadData(reportID, chatReportID);
    const transactionViolations = useTransactionViolations(iouTransactionID);

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
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
