import React, {useMemo} from 'react';
import CommonConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const PERSONAL_INFO_STEP_INDEXES = CONST.WALLET.PERSONAL_BANK_SUBSTEP_INDEXES;

function ConfirmationStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

    const isLoading = privatePersonalDetails?.isLoading ?? false;
    const error = ErrorUtils.getLatestErrorMessage(privatePersonalDetails ?? {});

    const personalDetails = useMemo(() => {
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const phone = bankAccountPersonalDetails?.phoneNumber ?? privatePersonalDetails?.phoneNumber;
        return {
            phoneNumber: (phone && parsePhoneNumber(phone, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
            legalFirstName: bankAccountPersonalDetails?.legalFirstName ?? privatePersonalDetails?.legalFirstName ?? '',
            legalLastName: bankAccountPersonalDetails?.legalLastName ?? privatePersonalDetails?.legalLastName ?? '',
            addressStreet: bankAccountPersonalDetails?.addressStreet ?? currentAddress?.addressLine1 ?? '',
            addressCity: bankAccountPersonalDetails?.addressCity ?? currentAddress?.city ?? '',
            addressState: bankAccountPersonalDetails?.addressState ?? currentAddress?.state ?? '',
            addressZip: bankAccountPersonalDetails?.addressZipCode ?? currentAddress?.zipCode ?? '',
        };
    }, [bankAccountPersonalDetails, privatePersonalDetails]);

    const summaryItems = [
        {
            description: translate('personalInfoStep.legalName'),
            title: `${personalDetails[PERSONAL_INFO_STEP_KEYS.FIRST_NAME]} ${personalDetails[PERSONAL_INFO_STEP_KEYS.LAST_NAME]}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('personalInfoStep.address'),
            title: `${personalDetails?.addressStreet}, ${personalDetails?.addressCity}, ${personalDetails?.addressState} ${personalDetails?.addressZip}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.ADDRESS);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: personalDetails[PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PERSONAL_INFO_STEP_INDEXES.PHONE_NUMBER);
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
        />
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
