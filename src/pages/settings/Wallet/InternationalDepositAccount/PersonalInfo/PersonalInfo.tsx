import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import Navigation from '@navigation/Navigation';
import {addPersonalBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Address from './substeps/AddressStep';
import Confirmation from './substeps/ConfirmationStep';
import LegalName from './substeps/LegalNameStep';
import ManualBankAccountDetails from './substeps/ManualBankAccountDetailsStep';
import PhoneNumber from './substeps/PhoneNumberStep';
import PlaidBankAccount from './substeps/PlaidBankAccountStep';
import getSkippedStepsPersonalInfo from './utils/getSkippedStepsPersonalInfo';

const bodyContentInfoSet: Array<React.ComponentType<SubStepProps>> = [LegalName, Address, PhoneNumber, Confirmation];
const bodyContentWithPlaid: Array<React.ComponentType<SubStepProps>> = [PlaidBankAccount, ...bodyContentInfoSet];
const bodyContentWithManualSetup: Array<React.ComponentType<SubStepProps>> = [ManualBankAccountDetails, ...bodyContentInfoSet];

function PersonalInfoPage() {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [personalBankAccount] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const isManual = personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});

    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});

    const submitBankAccountForm = () => {
        const bankAccounts = plaidData?.bankAccounts ?? [];

        const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === personalBankAccount?.selectedPlaidAccountID);
        const bankAccountWithToken = selectedPlaidBankAccount?.plaidAccessToken
            ? selectedPlaidBankAccount
            : {
                  ...selectedPlaidBankAccount,
                  plaidAccessToken: plaidData?.plaidAccessToken ?? '',
              };
        const finalPhoneNumber = personalBankAccount?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '';
        const accountData = {
            ...privatePersonalDetails,
            ...personalBankAccount,
            ...bankAccountWithToken,
            phoneNumber: formatE164PhoneNumber(finalPhoneNumber, countryCode),
        };
        addPersonalBankAccount(accountData, personalPolicyID);
    };

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
        bodyContent: isManual ? bodyContentWithManualSetup : bodyContentWithPlaid,
        skipSteps,
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
            headerTitle={translate('bankAccount.addBankAccount')}
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

PersonalInfoPage.displayName = 'PersonalInfoPage';

export default PersonalInfoPage;
