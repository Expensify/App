import React, {useEffect, useMemo} from 'react';
import type {ComponentType} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInitialSubStepForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBankInfoStep';
import getInputKeysForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep';
import {clearReimbursementAccountBankCreation, createCorpayBankAccount, getCorpayBankAccountFields} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import AccountHolderDetails from './subSteps/AccountHolderDetails';
import BankAccountDetails from './subSteps/BankAccountDetails';
import Confirmation from './subSteps/Confirmation';
import type BankInfoSubStepProps from './types';

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

type BankInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** ID of current policy */
    policyID: string | undefined;

    /** Array of step names */
    stepNames?: readonly string[];
};

function BankInfo({onBackButtonPress, onSubmit, policyID, stepNames}: BankInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';
    const country = reimbursementAccountDraft?.[COUNTRY] ?? reimbursementAccount?.achData?.[COUNTRY] ?? '';
    const inputKeys = getInputKeysForBankInfoStep(corpayFields);
    const values = useMemo(() => getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount), [inputKeys, reimbursementAccount, reimbursementAccountDraft]);
    const startFrom = useMemo(() => getInitialSubStepForBankInfoStep(values, corpayFields), [corpayFields, values]);

    const submit = () => {
        const {formFields, isLoading, isSuccess, ...corpayData} = corpayFields ?? {};

        createCorpayBankAccount({...values, ...corpayData} as ReimbursementAccountForm, policyID);
    };

    useNetwork({
        onReconnect: () => {
            getCorpayBankAccountFields(country, currency);
        },
    });

    useEffect(() => {
        if (reimbursementAccount?.isLoading === true || !!reimbursementAccount?.errors) {
            return;
        }

        if (reimbursementAccount?.isSuccess === true) {
            onSubmit();
            clearReimbursementAccountBankCreation();
        }
    }, [corpayFields?.bankCurrency, country, currency, onSubmit, reimbursementAccount?.errors, reimbursementAccount?.isLoading, reimbursementAccount?.isSuccess]);

    useEffect(() => {
        // No fetching when there is no country
        if (country === '') {
            return;
        }

        // When workspace currency is set to EUR we need to refetch if country from Step 1 doesn't match country inside fetched Corpay data
        if (currency === CONST.CURRENCY.EUR && country !== corpayFields?.bankCountry) {
            getCorpayBankAccountFields(country, currency);
            return;
        }

        // No fetching when workspace currency matches the currency inside fetched Corpay
        if (currency === corpayFields?.bankCurrency) {
            return;
        }

        getCorpayBankAccountFields(country, currency);
    }, [corpayFields?.bankCurrency, corpayFields?.bankCountry, country, currency]);

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
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
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

    if (corpayFields !== undefined && corpayFields?.isLoading === false && corpayFields?.isSuccess !== undefined && corpayFields?.isSuccess === false) {
        return <NotFoundPage />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID={BankInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            stepNames={stepNames}
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
