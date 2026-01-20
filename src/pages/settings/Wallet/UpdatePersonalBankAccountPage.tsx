import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import Navigation from '@navigation/Navigation';
import {updatePersonalBankAccountInfo} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Address from './InternationalDepositAccount/PersonalInfo/substeps/AddressStep';
import LegalName from './InternationalDepositAccount/PersonalInfo/substeps/LegalNameStep';
import PhoneNumber from './InternationalDepositAccount/PersonalInfo/substeps/PhoneNumberStep';
import getSkippedStepsPersonalInfo from './InternationalDepositAccount/PersonalInfo/utils/getSkippedStepsPersonalInfo';
import UpdatePersonalInfoConfirmation from './UpdatePersonalInfoConfirmation';

const bodyContent: Array<React.ComponentType<SubStepProps>> = [LegalName, Address, PhoneNumber, UpdatePersonalInfoConfirmation];

function UpdatePersonalBankAccountPage() {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const submitPersonalInfo = () => {
        const finalPhoneNumber = personalBankAccountDraft?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '';
        const accountData = {
            ...privatePersonalDetails,
            ...personalBankAccountDraft,
            phoneNumber: formatE164PhoneNumber(finalPhoneNumber, countryCode),
        };
        updatePersonalBankAccountInfo(accountData);
    };

    // Skip steps where personal info already exists
    // Step indices: 0 = LegalName, 1 = Address, 2 = PhoneNumber, 3 = Confirmation
    // getSkippedStepsPersonalInfo returns indices 1, 2, 3 for original flow, but we have 0-indexed steps
    const skipSteps = getSkippedStepsPersonalInfo(privatePersonalDetails);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        moveTo,
        screenIndex,
        goToTheLastStep,
    } = useSubStep({
        bodyContent,
        skipSteps,
        onFinished: submitPersonalInfo,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            Navigation.goBack();
            return;
        }
        prevScreen();
    };

    return (
        <InteractiveStepWrapper
            wrapperID={UpdatePersonalBankAccountPage.displayName}
            headerTitle={translate('addPersonalBankAccount.updatePersonalInfo')}
            handleBackButtonPress={handleBackButtonPress}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

UpdatePersonalBankAccountPage.displayName = 'UpdatePersonalBankAccountPage';

export default UpdatePersonalBankAccountPage;
