import React, {useEffect, useMemo} from 'react';
import type {ComponentType} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInitialSubStepForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBankInfoStep';
import getInputKeysForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep';
import {clearReimbursementAccountBankCreation, createCorpayBankAccount, getCorpayBankAccountFields} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import AccountHolderDetails from './subSteps/AccountHolderDetails';
import BankAccountDetails from './subSteps/BankAccountDetails';
import Confirmation from './subSteps/Confirmation';
import type {BankInfoSubStepProps} from './types';

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

type BankInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** ID of current policy */
    policyID: string | undefined;
};

function BankInfo({onBackButtonPress, onSubmit, policyID}: BankInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const country = reimbursementAccount?.achData?.[COUNTRY] ?? reimbursementAccountDraft?.[COUNTRY] ?? '';
    const inputKeys = getInputKeysForBankInfoStep(corpayFields);
    const values = useMemo(() => getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount), [inputKeys, reimbursementAccount, reimbursementAccountDraft]);
    const startFrom = getInitialSubStepForBankInfoStep(values, corpayFields);

    const submit = () => {
        const {formFields, isLoading, isSuccess, ...corpayData} = corpayFields ?? {};

        createCorpayBankAccount({...values, ...corpayData} as ReimbursementAccountForm, policyID);
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

    const bodyContent: Array<ComponentType<BankInfoSubStepProps>> = [BankAccountDetails, AccountHolderDetails, Confirmation];

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<BankInfoSubStepProps>({bodyContent, startFrom, onFinished: submit});

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
