import React, {useCallback, useEffect, useMemo} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {connectBankAccountManually, connectBankAccountWithPlaid} from '@userActions/BankAccounts';
import {hideBankAccountErrors} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Manual from './subSteps/Manual';
import Plaid from './subSteps/Plaid';

type BankInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Current Policy ID */
    policyID: string;

    /** Set the step of the USD verified bank account flow */
    setUSDBankAccountStep: (step: string | null) => void;
};

type BankInfoSubStepProps = SubStepProps & {
    setUSDBankAccountStep: (step: string | null) => void;
};

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const manualSubSteps: Array<React.ComponentType<BankInfoSubStepProps>> = [Manual];
const plaidSubSteps: Array<React.ComponentType<BankInfoSubStepProps>> = [Plaid];
const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();

function BankInfo({onBackButtonPress, policyID, setUSDBankAccountStep}: BankInfoProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const [plaidLinkToken] = useOnyx(ONYXKEYS.PLAID_LINK_TOKEN, {canBeMissing: true});
    const {translate} = useLocalize();

    const [redirectedFromPlaidToManual, setRedirectedFromPlaidToManual] = React.useState(false);
    const values = useMemo(() => getSubStepValues(BANK_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);

    let setupType = reimbursementAccount?.achData?.subStep ?? '';

    const shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID);
    const submit = useCallback(
        (submitData: unknown) => {
            const data = submitData as ReimbursementAccountForm;
            if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
                connectBankAccountManually(
                    bankAccountID,
                    {
                        [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: data[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
                        [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: data[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
                        [BANK_INFO_STEP_KEYS.BANK_NAME]: data[BANK_INFO_STEP_KEYS.BANK_NAME] ?? values?.bankName ?? '',
                        [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: data[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? values?.plaidAccountID,
                        [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: data[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? values?.plaidAccessToken ?? '',
                        [BANK_INFO_STEP_KEYS.PLAID_MASK]: data[BANK_INFO_STEP_KEYS.PLAID_MASK] ?? values?.mask ?? '',
                        [BANK_INFO_STEP_KEYS.IS_SAVINGS]: data[BANK_INFO_STEP_KEYS.IS_SAVINGS] ?? false,
                    },
                    policyID,
                );
            } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
                connectBankAccountWithPlaid(
                    bankAccountID,
                    {
                        [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: data[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
                        [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: data[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
                        [BANK_INFO_STEP_KEYS.BANK_NAME]: data[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
                        [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: data[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '',
                        [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: data[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
                        [BANK_INFO_STEP_KEYS.PLAID_MASK]: data[BANK_INFO_STEP_KEYS.PLAID_MASK] ?? '',
                        [BANK_INFO_STEP_KEYS.IS_SAVINGS]: data[BANK_INFO_STEP_KEYS.IS_SAVINGS] ?? false,
                    },
                    policyID,
                );
            }
        },
        [setupType, bankAccountID, values?.bankName, values?.plaidAccountID, values?.plaidAccessToken, values?.mask, policyID],
    );

    const bodyContent = setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID ? plaidSubSteps : manualSubSteps;
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep<BankInfoSubStepProps>({bodyContent, startFrom: 0, onFinished: submit});

    // Some services user connects to via Plaid return dummy account numbers and routing numbers e.g. Chase
    // In this case we need to redirect user to manual flow to enter real account number and routing number
    // and we need to do it only once so redirectedFromPlaidToManual flag is used
    useEffect(() => {
        if (redirectedFromPlaidToManual) {
            return;
        }
        if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL && values.bankName !== '' && !redirectedFromPlaidToManual) {
            setRedirectedFromPlaidToManual(true);
        }
    }, [redirectedFromPlaidToManual, setupType, values.bankName]);

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            onBackButtonPress();
            hideBankAccountErrors();
        } else {
            prevScreen();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID="BankInfo"
            shouldEnablePickerAvoiding={false}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            startStepIndex={1}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                setUSDBankAccountStep={setUSDBankAccountStep}
            />
        </InteractiveStepWrapper>
    );
}

export default BankInfo;
