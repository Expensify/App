import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
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
import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import Confirmation from './substeps/Confirmation';
import Manual from './substeps/Manual';
import Plaid from './substeps/Plaid';

type BankInfoOnyxProps = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: OnyxEntry<string>;

    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};

type BankInfoProps = BankInfoOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;
const manualSubsteps: Array<React.ComponentType<SubStepProps>> = [Manual, Confirmation];
const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [Plaid, Confirmation];
const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();

function BankInfo({reimbursementAccount, reimbursementAccountDraft, plaidLinkToken, onBackButtonPress}: BankInfoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [redirectedFromPlaidToManual, setRedirectedFromPlaidToManual] = React.useState(false);
    const values = useMemo(() => getSubstepValues(bankInfoStepKeys, reimbursementAccountDraft ?? {}, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);

    let setupType = reimbursementAccount?.achData?.subStep ?? '';

    const shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }

    const policyID = reimbursementAccount?.achData?.policyID ?? '';
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const submit = useCallback(() => {
        if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
            BankAccounts.connectBankAccountManually(
                bankAccountID,
                values[bankInfoStepKeys.ACCOUNT_NUMBER],
                values[bankInfoStepKeys.ROUTING_NUMBER],
                values[bankInfoStepKeys.PLAID_MASK],
                policyID
            );
        } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
            BankAccounts.connectBankAccountWithPlaid(bankAccountID, {
                [bankInfoStepKeys.ROUTING_NUMBER]: values[bankInfoStepKeys.ROUTING_NUMBER] ?? '',
                [bankInfoStepKeys.ACCOUNT_NUMBER]: values[bankInfoStepKeys.ACCOUNT_NUMBER] ?? '',
                [bankInfoStepKeys.BANK_NAME]: values[bankInfoStepKeys.BANK_NAME] ?? '',
                [bankInfoStepKeys.PLAID_ACCOUNT_ID]: values[bankInfoStepKeys.PLAID_ACCOUNT_ID] ?? '',
                [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: values[bankInfoStepKeys.PLAID_ACCESS_TOKEN] ?? '',
            }, policyID);
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
                    [bankInfoStepKeys.ROUTING_NUMBER]: '',
                    [bankInfoStepKeys.ACCOUNT_NUMBER]: '',
                    [bankInfoStepKeys.PLAID_MASK]: '',
                    [bankInfoStepKeys.IS_SAVINGS]: '',
                    [bankInfoStepKeys.BANK_NAME]: '',
                    [bankInfoStepKeys.PLAID_ACCOUNT_ID]: '',
                    [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: '',
                };
                ReimbursementAccountUtils.updateReimbursementAccountDraft(bankAccountData);
                BankAccounts.setBankAccountSubStep(null);
            }
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper testID={BankInfo.displayName}>
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('bankAccount.bankInfo')}
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
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
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
    plaidLinkToken: {
        key: ONYXKEYS.PLAID_LINK_TOKEN,
    },
})(BankInfo);
