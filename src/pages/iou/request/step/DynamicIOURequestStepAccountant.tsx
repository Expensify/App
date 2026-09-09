import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {setMoneyRequestAccountant} from '@libs/actions/IOU/MoneyRequest';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {createDraftWorkspaceAndNavigateToConfirmationScreen} from '@libs/ReportUtils';

import MoneyRequestAccountantSelector from '@pages/iou/request/MoneyRequestAccountantSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Accountant} from '@src/types/onyx/IOU';

import React from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepAccountantProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_ACCOUNTANT>;

function DynamicIOURequestStepAccountant({
    route: {
        params: {transactionID, iouType, action},
    },
}: DynamicIOURequestStepAccountantProps) {
    const {translate} = useLocalize();
    const {accountID, email = '', localCurrencyCode} = useCurrentUserPersonalDetails();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_ACCOUNTANT.path);

    const setAccountant = (accountant: Accountant) => {
        setMoneyRequestAccountant(transactionID, accountant, true);
    };

    const navigateToNextStep = () => {
        // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
        if (!hasActiveAdminPolicies) {
            createDraftWorkspaceAndNavigateToConfirmationScreen(
                introSelected,
                transactionID,
                action,
                generateDefaultWorkspaceName(email, lastWorkspaceNumber, translate),
                accountID,
                email,
                localCurrencyCode ?? CONST.CURRENCY.USD,
            );
            return;
        }

        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.path));
    };

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.whoIsYourAccountant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepAccountant"
        >
            <MoneyRequestAccountantSelector
                onFinish={navigateToNextStep}
                onAccountantSelected={setAccountant}
                iouType={iouType}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(DynamicIOURequestStepAccountant);
