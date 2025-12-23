import {activeAdminPoliciesSelector} from '@selectors/Policy';
import React, {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setMoneyRequestAccountant} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {createDraftWorkspaceAndNavigateToConfirmationScreen} from '@libs/ReportUtils';
import MoneyRequestAccountantSelector from '@pages/iou/request/MoneyRequestAccountantSelector';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Accountant} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type IOURequestStepAccountantProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT>;

function IOURequestStepAccountant({
    route: {
        params: {transactionID, reportID, iouType, backTo, action},
    },
}: IOURequestStepAccountantProps) {
    const {translate} = useLocalize();
    const {login} = useCurrentUserPersonalDetails();
    const selector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            return activeAdminPoliciesSelector(policies, login ?? '');
        },
        [login],
    );
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});

    const setAccountant = useCallback(
        (accountant: Accountant) => {
            setMoneyRequestAccountant(transactionID, accountant, true);
        },
        [transactionID],
    );

    const navigateToNextStep = useCallback(() => {
        // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
        const hasActiveAdminWorkspaces = (adminPolicies?.length ?? 0) > 0;
        if (!hasActiveAdminWorkspaces) {
            createDraftWorkspaceAndNavigateToConfirmationScreen(introSelected, transactionID, action);
            return;
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID, Navigation.getActiveRoute(), action));
    }, [adminPolicies?.length, iouType, transactionID, reportID, action, introSelected]);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.whoIsYourAccountant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepAccountant"
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

export default withWritableReportOrNotFound(IOURequestStepAccountant);
