import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import useReportPickerActions from './IOURequestStepReport/hooks/useReportPickerActions';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_REPORT> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_REPORT>;

function DynamicIOURequestStepReport({route, transaction}: DynamicIOURequestStepReportProps) {
    const {action, iouType, transactionID, reportID: reportIDFromRoute, reportActionID} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_REPORT.path);
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);

    const handleGoBack = () => {
        if (isEditing) {
            Navigation.dismissToSuperWideRHP();
        } else {
            Navigation.goBack(backPath);
        }
    };

    const {listProps, reportOrDraftReport} = useReportPickerActions({transaction, transactionID, action, iouType, reportIDFromRoute, goBack: handleGoBack});

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, reportOrDraftReport, transaction);

    return (
        <IOURequestEditReportCommon
            {...listProps}
            backTo={backPath}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(DynamicIOURequestStepReport));
