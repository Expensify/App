import DestinationPicker from '@components/DestinationPicker';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/SelectionListWithSections/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';

import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit, getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import {getIOURequestPolicyID, setCustomUnitRateID, setMoneyRequestCurrency} from '@userActions/IOU/MoneyRequest';
import {clearSubrates} from '@userActions/IOU/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import PerDiemRatesGate from './PerDiemRatesGate';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepDestinationProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION_EDIT> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION_EDIT>;

function DynamicIOURequestStepDestination({
    report,
    route: {
        params: {transactionID, action},
    },
    transaction,
}: DynamicIOURequestStepDestinationProps) {
    const editBackPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION_EDIT.path);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const reportPolicyID = getIOURequestPolicyID(transaction, report);
    const policyID = reportPolicyID === CONST.POLICY.ID_FAKE ? getPolicyByCustomUnitID(transaction, allPolicies)?.id : reportPolicyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {accountID} = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const customUnit = getPerDiemCustomUnit(policy);
    const selectedDestination = transaction?.comment?.customUnit?.customUnitRateID;

    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(editBackPath);
    };

    const updateDestination = (destination: ListItem & {currency: string}) => {
        // A new expense is only blocked once the user starts filling it in, which on the per diem form is the destination.
        if (
            action === CONST.IOU.ACTION.CREATE &&
            policy &&
            shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)
        ) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        if (isEmptyObject(customUnit)) {
            return;
        }
        if (selectedDestination !== destination.keyForList) {
            setCustomUnitRateID(transactionID, destination.keyForList ?? '', transaction, policy, false, personalPolicy?.outputCurrency);
            setMoneyRequestCurrency(transactionID, destination.currency);
            clearSubrates(transactionID);
        }

        navigateBack();
    };

    return (
        <ScreenWrapper
            includePaddingTop={false}
            testID="IOURequestStepDestination-container"
            shouldShowOfflineIndicator={false}
        >
            <StepScreenWrapper
                headerTitle={translate('common.destination')}
                onBackButtonPress={navigateBack}
                shouldShowWrapper
                shouldShowNotFoundPage={isEmptyObject(policy)}
                testID="DynamicIOURequestStepDestination"
            >
                <PerDiemRatesGate policyID={policy?.id}>
                    {!!policy?.id && (
                        <DestinationPicker
                            selectedDestination={selectedDestination}
                            policyID={policy.id}
                            onSubmit={updateDestination}
                        />
                    )}
                </PerDiemRatesGate>
            </StepScreenWrapper>
        </ScreenWrapper>
    );
}

const DynamicIOURequestStepDestinationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepDestination);

const DynamicIOURequestStepDestinationWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepDestinationWithFullTransactionOrNotFound);
export default DynamicIOURequestStepDestinationWithWritableReportOrNotFound;
