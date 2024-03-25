import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccountUtils from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';
import Confirmation from './substeps/Confirmation';
import Manual from './substeps/Manual';
import Plaid from './substeps/Plaid';

type BankInfoOnyxProps = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: OnyxEntry<string>;

    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;

    policyID: string;
};

type BankInfoProps = BankInfoOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const manualSubsteps: Array<React.ComponentType<SubStepProps>> = [Manual, Confirmation];
const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [Plaid, Confirmation];
const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();

function BankInfo({reimbursementAccount, reimbursementAccountDraft, plaidLinkToken, onBackButtonPress, policyID}: BankInfoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [redirectedFromPlaidToManual, setRedirectedFromPlaidToManual] = React.useState(false);
    const values = useMemo(() => getSubstepValues(BANK_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);

    let setupType = reimbursementAccount?.achData?.subStep ?? '';

    const shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const submit = useCallback(() => {
        if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
            BankAccounts.connectBankAccountManually(
                bankAccountID,
                {
                    [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: values[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: values[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.BANK_NAME]: values[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: values[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: values[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_MASK]: values[BANK_INFO_STEP_KEYS.PLAID_MASK] ?? '',
                    [BANK_INFO_STEP_KEYS.IS_SAVINGS]: values[BANK_INFO_STEP_KEYS.IS_SAVINGS] ?? false,
                },
                policyID,
            );
        } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
            BankAccounts.connectBankAccountWithPlaid(
                bankAccountID,
                {
                    [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: values[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: values[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.BANK_NAME]: values[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: values[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: values[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_MASK]: values[BANK_INFO_STEP_KEYS.PLAID_MASK] ?? '',
                    [BANK_INFO_STEP_KEYS.IS_SAVINGS]: values[BANK_INFO_STEP_KEYS.IS_SAVINGS] ?? false,
                },
                policyID,
            );
        }
    }, [setupType, values, bankAccountID, policyID]);

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
            moveTo(0);
        }
    }, [moveTo, redirectedFromPlaidToManual, setupType, values]);

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
        <ScreenWrapper
            testID={BankInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('bankAccount.bankInfo')}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={0}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

BankInfo.displayName = 'BankInfo';

export default withOnyx<BankInfoProps, BankInfoOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
    plaidLinkToken: {
        key: ONYXKEYS.PLAID_LINK_TOKEN,
    },
})(BankInfo);
