import type {ComponentType} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import BankAccountDetails from './substeps/BankAccountDetails';
import Confirmation from './substeps/Confirmation';
import UploadStatement from './substeps/UploadStatement';
import type {BankInfoSubStepProps, CorpayFormField} from './types';

type BankInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

const bodyContent: Array<ComponentType<BankInfoSubStepProps>> = [BankAccountDetails, UploadStatement, Confirmation];

function BankInfo({onBackButtonPress, onSubmit}: BankInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayFields, setCorpayFields] = useState<CorpayFormField[]>([]);
    const country = reimbursementAccountDraft?.[COUNTRY] ?? '';
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';

    const submit = () => {
        onSubmit();
    };

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
        resetScreenIndex,
    } = useSubStep<BankInfoSubStepProps>({bodyContent, startFrom: 0, onFinished: submit});

    // Temporary solution to get the fields for the corpay bank account fields
    useEffect(() => {
        const response = BankAccounts.getCorpayBankAccountFields(country, currency);
        setCorpayFields((response?.formFields as CorpayFormField[]) ?? []);
    }, [country, currency]);

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else if (currency === CONST.CURRENCY.AUD) {
            prevScreen();
        } else {
            resetScreenIndex();
        }
    };

    const handleNextScreen = useCallback(() => {
        if (currency !== CONST.CURRENCY.AUD) {
            goToTheLastStep();
            return;
        }

        nextScreen();
    }, [currency, goToTheLastStep, nextScreen]);

    return (
        <InteractiveStepWrapper
            wrapperID={BankInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={1}
        >
            <SubStep
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={moveTo}
                corpayFields={corpayFields}
            />
        </InteractiveStepWrapper>
    );
}

BankInfo.displayName = 'BankInfo';

export default BankInfo;
