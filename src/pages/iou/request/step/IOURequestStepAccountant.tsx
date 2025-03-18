import React, {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import {setMoneyRequestAccountant} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestAccountantSelector from '@pages/iou/request/MoneyRequestAccountantSelector';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Accountant} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepAccountantProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT>;

function IOURequestStepAccountant({
    route: {
        params: {transactionID, reportID, iouType, backTo, action},
    },
}: IOURequestStepAccountantProps) {
    const {translate} = useLocalize();

    const setAccountant = useCallback(
        (accountant: Accountant) => {
            setMoneyRequestAccountant(transactionID, accountant, true);
        },
        [transactionID],
    );

    const navigateToParticipantsStep = useCallback(() => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID, undefined, action));
    }, [iouType, transactionID, reportID, action]);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.whoIsYourAccountant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepAccountant.displayName}
        >
            <MoneyRequestAccountantSelector
                onFinish={navigateToParticipantsStep}
                onAccountantSelected={setAccountant}
                iouType={iouType}
                action={action}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAccountant.displayName = 'IOURequestStepAccountant';

export default withWritableReportOrNotFound(IOURequestStepAccountant);
