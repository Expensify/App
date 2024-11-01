import React, {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccountUtils from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Manual from './substeps/Manual';
import Plaid from './substeps/Plaid';

type BankInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Current Policy ID */
    policyID: string;
};

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const manualSubsteps: Array<React.ComponentType<SubStepProps>> = [Manual];
const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [Plaid];
const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();

function BankInfo({onBackButtonPress, policyID}: BankInfoProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [plaidLinkToken] = useOnyx(ONYXKEYS.PLAID_LINK_TOKEN);
    const {translate} = useLocalize();

    const [redirectedFromPlaidToManual, setRedirectedFromPlaidToManual] = React.useState(false);
    const values = useMemo(() => getSubstepValues(BANK_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);

    let setupType = reimbursementAccount?.achData?.subStep ?? '';

    const shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '-1');
    const submit = useCallback(
        (submitData: unknown) => {
            const data = submitData as ReimbursementAccountForm;
            if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
                BankAccounts.connectBankAccountManually(
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
            } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
                BankAccounts.connectBankAccountWithPlaid(
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
        [setupType, bankAccountID, policyID],
    );

    const bodyContent = setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID ? plaidSubsteps : manualSubsteps;
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

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
    }, [redirectedFromPlaidToManual, setupType, values]);

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            if (bankAccountID) {
                onBackButtonPress();
            } else {
                const bankAccountData = {
                    [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: '',
                    [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: '',
                    [BANK_INFO_STEP_KEYS.PLAID_MASK]: '',
                    [BANK_INFO_STEP_KEYS.IS_SAVINGS]: false,
                    [BANK_INFO_STEP_KEYS.BANK_NAME]: '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: '',
                };
                ReimbursementAccountUtils.updateReimbursementAccountDraft(bankAccountData);
                ReimbursementAccountUtils.hideBankAccountErrors();
                BankAccounts.setBankAccountSubStep(null);
            }
        } else {
            prevScreen();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID={BankInfo.displayName}
            shouldEnablePickerAvoiding={false}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            startStepIndex={0}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

BankInfo.displayName = 'BankInfo';

export default BankInfo;
