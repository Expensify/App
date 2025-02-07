import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const PERSONAL_INFO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.PERSONAL_INFO;

function Confirmation({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const isLoading = reimbursementAccount?.isLoading ?? false;
    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount ?? {});

    const summaryItems = [
        {
            description: translate('personalInfoStep.legalName'),
            title: `${values[PERSONAL_INFO_STEP_KEYS.FIRST_NAME]} ${values[PERSONAL_INFO_STEP_KEYS.LAST_NAME]}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: values[PERSONAL_INFO_STEP_KEYS.DOB],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.DATE_OF_BIRTH);
            },
        },
        {
            description: translate('personalInfoStep.last4SSN'),
            title: values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.SSN);
            },
        },
        {
            description: translate('personalInfoStep.address'),
            title: `${values[PERSONAL_INFO_STEP_KEYS.STREET]}, ${values[PERSONAL_INFO_STEP_KEYS.CITY]}, ${values[PERSONAL_INFO_STEP_KEYS.STATE]} ${values[PERSONAL_INFO_STEP_KEYS.ZIP_CODE]}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.ADDRESS);
            },
        },
    ];

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('personalInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks
            onfidoLinksTitle={`${translate('personalInfoStep.byAddingThisBankAccount')} `}
            isLoading={isLoading}
            error={error}
            shouldApplySafeAreaPaddingBottom={false}
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
