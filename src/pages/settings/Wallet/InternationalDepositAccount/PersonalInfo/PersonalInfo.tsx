import React, {useCallback, useMemo} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import Navigation from '@navigation/Navigation';
import {addPersonalBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Address from './substeps/AddressStep';
import Confirmation from './substeps/ConfirmationStep';
import LegalName from './substeps/LegalNameStep';
import PhoneNumber from './substeps/PhoneNumberStep';
import getInitialSubstepForPersonalInfo from './utils/getInitialSubstepForPersonalInfo';

const bodyContent: Array<React.ComponentType<SubStepProps>> = [LegalName, Address, PhoneNumber, Confirmation];

function PersonalInfoPage() {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [personalBankAccount] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM);

    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});

    const personalDetails = useMemo(() => {
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const phone = personalBankAccount?.phoneNumber ?? privatePersonalDetails?.phoneNumber;
        return {
            phoneNumber: (phone && parsePhoneNumber(phone, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
            legalFirstName: personalBankAccount?.legalFirstName ?? privatePersonalDetails?.legalFirstName ?? '',
            legalLastName: personalBankAccount?.legalLastName ?? privatePersonalDetails?.legalLastName ?? '',
            addressStreet: personalBankAccount?.addressStreet ?? currentAddress?.addressLine1 ?? '',
            addressCity: personalBankAccount?.addressCity ?? currentAddress?.city ?? '',
            addressState: personalBankAccount?.addressState ?? currentAddress?.state ?? '',
            addressZip: personalBankAccount?.addressZipCode ?? currentAddress?.zipCode ?? '',
        };
    }, [personalBankAccount, privatePersonalDetails]);

    const submitBankAccountForm = useCallback(() => {
        const bankAccounts = plaidData?.bankAccounts ?? [];
        const policyID = personalBankAccount?.policyID;
        const source = personalBankAccount?.source;

        const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === personalBankAccount?.selectedPlaidAccountID);

        if (selectedPlaidBankAccount) {
            const bankAccountWithToken = selectedPlaidBankAccount.plaidAccessToken
                ? selectedPlaidBankAccount
                : {
                      ...selectedPlaidBankAccount,
                      plaidAccessToken: plaidData?.plaidAccessToken ?? '',
                  };
            addPersonalBankAccount(bankAccountWithToken, policyID, source);
        }
    }, [plaidData, personalBankAccount]);

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(personalDetails), [personalDetails]);

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
        startFrom,
        onFinished: submitBankAccountForm,
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
            wrapperID={PersonalInfoPage.displayName}
            headerTitle={translate('personalInfoStep.personalInfo')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={1}
            stepNames={CONST.WALLET.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

PersonalInfoPage.displayName = 'PersonalInfoPage';

export default PersonalInfoPage;
