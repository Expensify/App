import React from 'react';
import CommonConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {clearPersonalBankAccountErrors} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

const DEFAULT_OBJECT = {};

function UpdatePersonalInfoConfirmation({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const isLoading = personalBankAccount?.isLoading ?? false;
    const error = getLatestErrorMessage(personalBankAccount ?? DEFAULT_OBJECT);

    const getPersonalDetails = () => {
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const phone = bankAccountPersonalDetails?.phoneNumber ?? privatePersonalDetails?.phoneNumber;
        return {
            phoneNumber: (phone && formatE164PhoneNumber(phone, countryCode)) ?? '',
            legalFirstName: bankAccountPersonalDetails?.legalFirstName ?? privatePersonalDetails?.legalFirstName ?? '',
            legalLastName: bankAccountPersonalDetails?.legalLastName ?? privatePersonalDetails?.legalLastName ?? '',
            addressStreet: bankAccountPersonalDetails?.addressStreet ?? currentAddress?.street ?? '',
            addressCity: bankAccountPersonalDetails?.addressCity ?? currentAddress?.city ?? '',
            addressState: bankAccountPersonalDetails?.addressState ?? currentAddress?.state ?? '',
            addressZip: bankAccountPersonalDetails?.addressZipCode ?? currentAddress?.zip ?? '',
        };
    };

    const moveToEditStep = (step: number) => {
        if (error) {
            clearPersonalBankAccountErrors();
        }
        onMove(step);
    };

    const getSummaryItems = () => {
        const personalDetails = getPersonalDetails();
        const legalNameLabel = translate('personalInfoStep.legalName');
        const addressLabel = translate('personalInfoStep.address');
        const phoneNumberLabel = translate('common.phoneNumber');

        return [
            {
                description: legalNameLabel,
                title: `${personalDetails[PERSONAL_INFO_STEP_KEYS.FIRST_NAME]} ${personalDetails[PERSONAL_INFO_STEP_KEYS.LAST_NAME]}`,
                shouldShowRightIcon: true,
                onPress: () => {
                    moveToEditStep(0);
                },
            },
            {
                description: addressLabel,
                title: `${personalDetails.addressStreet}, ${personalDetails.addressCity}, ${personalDetails.addressState} ${personalDetails.addressZip}`,
                shouldShowRightIcon: true,
                onPress: () => {
                    moveToEditStep(1);
                },
            },
            {
                description: phoneNumberLabel,
                title: personalDetails[PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER],
                shouldShowRightIcon: true,
                onPress: () => {
                    moveToEditStep(2);
                },
            },
        ];
    };

    const summaryItems = getSummaryItems();

    return (
        <CommonConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            showOnfidoLinks={false}
            pageTitle={translate('personalInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            isLoading={isLoading}
            error={error}
        />
    );
}

UpdatePersonalInfoConfirmation.displayName = 'UpdatePersonalInfoConfirmation';

export default UpdatePersonalInfoConfirmation;
