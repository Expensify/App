import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import navigation from '@navigation/Navigation';
import Navigation from '@navigation/Navigation';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getInitialSubstepForBankInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForBankInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import handleStepSelected from '@pages/ReimbursementAccount/utils/handleStepSelected';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Confirmation from './substeps/Confirmation';
import Manual from './substeps/Manual';
import Plaid from './substeps/Plaid';

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,
};

const defaultProps = {
    plaidLinkToken: '',
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;
const manualSubsteps = [Manual, Confirmation];
const plaidSubsteps = [Plaid, Confirmation];
const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();

function BankInfo({reimbursementAccount, reimbursementAccountDraft, plaidLinkToken}) {
    const {translate} = useLocalize();

    const values = useMemo(() => getSubstepValues(bankInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    let setupType = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'subStep');

    const shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }

    const startFrom = useMemo(() => getInitialSubstepForBankInfo(values, setupType), [setupType, values]);

    const submit = useCallback(() => {
        if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
            BankAccounts.connectBankAccountManually(
                Number(getDefaultValueForReimbursementAccountField(reimbursementAccount, bankInfoStepKeys.BANK_ACCOUNT_ID, '0')),
                values[bankInfoStepKeys.ACCOUNT_NUMBER],
                values[bankInfoStepKeys.ROUTING_NUMBER],
                values[bankInfoStepKeys.PLAID_MASK],
            );
        } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
            BankAccounts.connectBankAccountWithPlaid(Number(getDefaultValueForReimbursementAccountField(reimbursementAccount, bankInfoStepKeys.BANK_ACCOUNT_ID, '0')), {
                [bankInfoStepKeys.ROUTING_NUMBER]: values[bankInfoStepKeys.ROUTING_NUMBER],
                [bankInfoStepKeys.ACCOUNT_NUMBER]: values[bankInfoStepKeys.ACCOUNT_NUMBER],
                [bankInfoStepKeys.PLAID_MASK]: values[bankInfoStepKeys.PLAID_MASK],
                [bankInfoStepKeys.IS_SAVINGS]: values[bankInfoStepKeys.IS_SAVINGS],
                [bankInfoStepKeys.BANK_NAME]: values[bankInfoStepKeys.BANK_NAME],
                [bankInfoStepKeys.PLAID_ACCOUNT_ID]: values[bankInfoStepKeys.PLAID_ACCOUNT_ID],
                [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: values[bankInfoStepKeys.PLAID_ACCESS_TOKEN],
            });
        }
        navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
    }, [reimbursementAccount, setupType, values]);

    const bodyContent = setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID ? plaidSubsteps : manualSubsteps;
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            BankAccounts.setBankAccountSubStep(null);
            Navigation.goBack(ROUTES.HOME);
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper testID={BankInfo.displayName}>
            <HeaderWithBackButton
                shouldShowBackButton={!(setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID && screenIndex === 0)}
                onBackButtonPress={handleBackButtonPress}
                title={translate('bankAccount.bankInfo')}
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={handleStepSelected}
                    startStep={0}
                    stepNames={CONST.BANK_ACCOUNT.STEPS_HEADER_STEP_NAMES}
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

BankInfo.propTypes = propTypes;
BankInfo.defaultProps = defaultProps;
BankInfo.displayName = 'BankInfo';

export default withOnyx({
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
