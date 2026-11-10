import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
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

function DynamicIOURequestStepReport({route, navigation, transaction}: DynamicIOURequestStepReportProps) {
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

    // The form this page was opened from sits right below it in the stack and reads the expense type from its own route.
    const setFormIOUType = (formIOUType: IOUType) => {
        const {routes} = navigation.getState();
        const formRoute = routes.at(routes.findIndex((stackRoute) => stackRoute.key === route.key) - 1);
        if (!formRoute || formRoute.key === route.key) {
            return;
        }
        Navigation.setParams({iouType: formIOUType}, formRoute.key);
    };

    const {listProps, reportOrDraftReport} = useReportPickerActions({transaction, transactionID, action, iouType, reportIDFromRoute, goBack: handleGoBack, setFormIOUType});

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, reportOrDraftReport, transaction);

    return (
        <IOURequestEditReportCommon
            {...listProps}
            createReportSentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.EDIT_REPORT_CREATE_REPORT}
            autoReportSentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.EDIT_REPORT_AUTO_REPORT}
            removeFromReportSentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.EDIT_REPORT_REMOVE_FROM_REPORT}
            backTo={backPath}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(DynamicIOURequestStepReport));
