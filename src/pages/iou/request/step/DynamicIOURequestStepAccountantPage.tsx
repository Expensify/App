import {activeAdminPoliciesSelector} from '@selectors/Policy';
import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setMoneyRequestAccountant} from '@libs/actions/IOU/MoneyRequest';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {createDraftWorkspaceAndNavigateToConfirmationScreen} from '@libs/ReportUtils';
import MoneyRequestAccountantSelector from '@pages/iou/request/MoneyRequestAccountantSelector';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Accountant} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type DynamicIOURequestStepAccountantPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_ACCOUNTANT>;

function DynamicIOURequestStepAccountantPage({
    route: {
        params: {transactionID, reportID, iouType, action},
    },
}: DynamicIOURequestStepAccountantPageProps) {
    const {translate} = useLocalize();
    const {accountID, login, email = '', localCurrencyCode} = useCurrentUserPersonalDetails();
    const selector = (policies: OnyxCollection<Policy>) => activeAdminPoliciesSelector(policies, login ?? '');
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_ACCOUNTANT.path);

    const setAccountant = (accountant: Accountant) => {
        setMoneyRequestAccountant(transactionID, accountant, true);
    };

    const navigateToNextStep = () => {
        // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
        const hasActiveAdminWorkspaces = (adminPolicies?.length ?? 0) > 0;
        if (!hasActiveAdminWorkspaces) {
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

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID, Navigation.getActiveRoute(), action));
    };

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.whoIsYourAccountant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepAccountantPage"
        >
            <MoneyRequestAccountantSelector
                onFinish={navigateToNextStep}
                onAccountantSelected={setAccountant}
                iouType={iouType}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(DynamicIOURequestStepAccountantPage);
