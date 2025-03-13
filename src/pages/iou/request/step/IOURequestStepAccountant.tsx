import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {setMoneyRequestAttendees, updateMoneyRequestAttendees} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getAttendees} from '@libs/TransactionUtils';
import MoneyRequestAccountantSelector from '@pages/iou/request/MoneyRequestAccountantSelector';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepAccountantOnyxProps = {
    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
};

type IOURequestStepAccountantProps = IOURequestStepAccountantOnyxProps & WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT>;

function IOURequestStepAccountant({
    route: {
        params: {transactionID, reportID, iouType, backTo, action},
    },
    policy,
    policyTags,
    policyCategories,
}: IOURequestStepAccountantProps) {
    const {translate} = useLocalize();

    const setAccountant = useCallback(
        (v: Attendee[]) => {
            setMoneyRequestAttendees(transactionID, v, true);
        },
        [backTo, policy, policyCategories, policyTags, reportID, transactionID],
    );

    const saveAttendees = useCallback(() => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID, undefined, action));
    }, [backTo, policy, policyCategories, policyTags, reportID, transactionID]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.attendees')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepAccountant.displayName}
        >
            <MoneyRequestAccountantSelector
                onFinish={saveAttendees}
                onAttendeesAdded={setAccountant}
                iouType={iouType}
                action={action}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAccountant.displayName = 'IOURequestStepAccountant';

export default withWritableReportOrNotFound(IOURequestStepAccountant);
