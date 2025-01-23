import type {ComponentType} from 'react';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {clearReimbursementAccountBankCreation, createCorpayBankAccount, getCorpayBankAccountFields} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import AccountHolderDetails from './substeps/AccountHolderDetails';
import BankAccountDetails from './substeps/BankAccountDetails';
import Confirmation from './substeps/Confirmation';
import UploadStatement from './substeps/UploadStatement';
import type {BankInfoSubStepProps} from './types';

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

type BankInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

function BankInfo({onBackButtonPress, onSubmit}: BankInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const country = reimbursementAccountDraft?.[COUNTRY] ?? reimbursementAccountDraft?.[COUNTRY] ?? '';

    const submit = () => {
        const {formFields, isLoading, isSuccess, ...corpayData} = corpayFields ?? {};

        createCorpayBankAccount({...reimbursementAccountDraft, ...corpayData} as ReimbursementAccountForm);
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isLoading || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess) {
            onSubmit();
            clearReimbursementAccountBankCreation();
        }

        return () => clearReimbursementAccountBankCreation();
    }, [onSubmit, reimbursementAccount?.errors, reimbursementAccount?.isCreateCorpayBankAccount, reimbursementAccount?.isLoading, reimbursementAccount?.isSuccess]);

    useEffect(() => {
        getCorpayBankAccountFields(country, currency);
    }, [country, currency]);

    const bodyContent: Array<ComponentType<BankInfoSubStepProps>> =
        currency !== CONST.CURRENCY.AUD ? [BankAccountDetails, AccountHolderDetails, Confirmation] : [BankAccountDetails, AccountHolderDetails, UploadStatement, Confirmation];

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<BankInfoSubStepProps>({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    if (corpayFields?.isLoading !== undefined && !corpayFields?.isLoading && corpayFields?.isSuccess !== undefined && !corpayFields?.isSuccess) {
        return <NotFoundPage />;
    }

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
                onNext={nextScreen}
                onMove={moveTo}
                corpayFields={corpayFields}
            />
        </InteractiveStepWrapper>
    );
}

BankInfo.displayName = 'BankInfo';

export default BankInfo;
