import React, {useMemo} from 'react';
import CommonConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getSubstepValues from '@pages/EnablePayments/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const PERSONAL_INFO_STEP_INDEXES = CONST.WALLET.SUBSTEP_INDEXES.PERSONAL_INFO;

function ConfirmationStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {canBeMissing: true});
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, {canBeMissing: true});

    const isLoading = walletAdditionalDetails?.isLoading ?? false;
    const error = getLatestErrorMessage(walletAdditionalDetails ?? {});
    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails), [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    const shouldAskForFullSSN = walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN;

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
            description: translate('personalInfoStep.address'),
            title: `${values[PERSONAL_INFO_STEP_KEYS.STREET]}, ${values[PERSONAL_INFO_STEP_KEYS.CITY]}, ${values[PERSONAL_INFO_STEP_KEYS.STATE]} ${values[PERSONAL_INFO_STEP_KEYS.ZIP_CODE]}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.ADDRESS);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: values[PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.PHONE_NUMBER);
            },
        },
        {
            description: translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN'),
            title: values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.SSN);
            },
        },
    ];

    return (
        <CommonConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('personalInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks
            onfidoLinksTitle={`${translate('personalInfoStep.byAddingThisBankAccount')} `}
            isLoading={isLoading}
            error={error}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        />
    );
}

export default ConfirmationStep;
