import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import {setMoneyRequestAccountant} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {hasActiveAdminWorkspaces as hasActiveAdminWorkspacesUtil} from '@libs/PolicyUtils';
import {createDraftWorkspaceAndNavigateToConfirmationScreen} from '@libs/ReportUtils';
import MoneyRequestAccountantSelector from '@pages/iou/request/MoneyRequestAccountantSelector';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email, canBeMissing: false});
    const {translate} = useLocalize();

    const setAccountant = useCallback(
        (accountant: Accountant) => {
            setMoneyRequestAccountant(transactionID, accountant, true);
        },
        [transactionID],
    );

    const navigateToNextStep = useCallback(() => {
        // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
        const hasActiveAdminWorkspaces = hasActiveAdminWorkspacesUtil(currentUserLogin);
        if (!hasActiveAdminWorkspaces) {
            createDraftWorkspaceAndNavigateToConfirmationScreen(transactionID, action);
            return;
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID, undefined, action));
    }, [iouType, transactionID, reportID, action, currentUserLogin]);

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
                onFinish={navigateToNextStep}
                onAccountantSelected={setAccountant}
                iouType={iouType}
                action={action}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAccountant.displayName = 'IOURequestStepAccountant';

export default withWritableReportOrNotFound(IOURequestStepAccountant);
