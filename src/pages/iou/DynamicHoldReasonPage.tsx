import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {putOnHold} from '@libs/actions/IOU/Hold';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {isGroupPolicyByType} from '@libs/PolicyUtils';
import {getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditMoneyRequest} from '@libs/ReportUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import {clearErrorFields, clearErrors, setErrors} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {policyTypeSelector} from '@selectors/Policy';
import {getReportOwnerAccountID} from '@selectors/Report';
import React, {useCallback, useEffect} from 'react';

import HoldReasonFormView from './HoldReasonFormView';

type DynamicHoldReasonPageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DYNAMIC_HOLD_REASON>;

function DynamicHoldReasonPage({route}: DynamicHoldReasonPageProps) {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_HOLD_REASON.path);

    const {transactionID, holdReportID} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${holdReportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const {isOffline} = useNetwork();
    const ancestors = useAncestors(report);

    const [policyType] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyTypeSelector,
    });
    const [parentReportOwnerAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {selector: getReportOwnerAccountID});
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    // We first check if the report is part of a policy - if not, then it's a personal request (1:1 request)
    // For personal requests, we need to allow both users to put the request on hold
    const isWorkspaceRequest = isGroupPolicyByType(policyType);
    const isSubmitter = parentReportOwnerAccountID === currentUserAccountID;
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
        // as we do not allow requestee to edit fields like description and amount.
        // But, we still want the requestee to be able to put the request on hold
        if (isMoneyRequestAction(parentReportAction) && !canEditMoneyRequest(parentReportAction, transaction, false, undefined, undefined, parentReportActions) && isWorkspaceRequest) {
            return;
        }

        putOnHold(
            transactionID,
            values.comment,
            holdReportID,
            isOffline,
            currentUserLogin ?? '',
            currentUserAccountID,
            transactionViolations,
            isTrackIntentUser,
            delegateAccountID,
            ancestors,
        );
        Navigation.goBack(backPath);
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT], translate);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }
            // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
            // as we do not allow requestee to edit fields like description and amount.
            // But, we still want the requestee to be able to put the request on hold
            if (isMoneyRequestAction(parentReportAction) && !canEditMoneyRequest(parentReportAction, transaction, false, undefined, undefined, parentReportActions) && isWorkspaceRequest) {
                const formErrors = {};
                addErrorMessage(formErrors, 'reportModified', translate('common.error.requestModified'));
                setErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM, formErrors);
            }

            return errors;
        },
        [parentReportAction, parentReportActions, isWorkspaceRequest, translate, transaction],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
    }, []);

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backPath}
            isSubmitter={isSubmitter}
        />
    );
}

export default DynamicHoldReasonPage;
