import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as PlaidDataProps from './plaidDataPropTypes';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** Contains plaid data */
    plaidData: PlaidDataProps.plaidDataPropTypes,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,
};

const defaultProps = {
    plaidData: PlaidDataProps.plaidDataDefaultProps,
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
};

function BankAccountPlaidStep(props) {
    const styles = useThemeStyles();
    const {plaidData, receivedRedirectURI, plaidLinkOAuthToken, reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, getDefaultStateForField, translate} = props;
    const isFocused = useIsFocused();

    const validate = useCallback((values) => {
        const errorFields = {};
        if (!values.acceptTerms) {
            errorFields.acceptTerms = 'common.error.acceptTerms';
        }

        return errorFields;
    }, []);

    useEffect(() => {
        const plaidBankAccounts = lodashGet(plaidData, 'bankAccounts') || [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        BankAccounts.setBankAccountSubStep(null);
    }, [isFocused, plaidData]);

    const submit = useCallback(() => {
        const selectedPlaidBankAccount = _.findWhere(lodashGet(plaidData, 'bankAccounts', []), {
            plaidAccountID: lodashGet(reimbursementAccountDraft, 'plaidAccountID', ''),
        });

        const bankAccountData = {
            routingNumber: selectedPlaidBankAccount.routingNumber,
            accountNumber: selectedPlaidBankAccount.accountNumber,
            plaidMask: selectedPlaidBankAccount.mask,
            isSavings: selectedPlaidBankAccount.isSavings,
            bankName: lodashGet(plaidData, 'bankName') || '',
            plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
            plaidAccessToken: lodashGet(plaidData, 'plaidAccessToken') || '',
        };
        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);

        const bankAccountID = lodashGet(reimbursementAccount, 'achData.bankAccountID') || 0;
        BankAccounts.connectBankAccountWithPlaid(bankAccountID, bankAccountData);
    }, [reimbursementAccount, reimbursementAccountDraft, plaidData]);

    const bankAccountID = lodashGet(reimbursementAccount, 'achData.bankAccountID') || 0;
    const selectedPlaidAccountID = lodashGet(reimbursementAccountDraft, 'plaidAccountID', '');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BankAccountPlaidStep.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                stepCounter={{step: 1, total: 5}}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={onBackButtonPress}
            />
            <FormProvider
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                validate={validate}
                onSubmit={submit}
                scrollContextEnabled
                submitButtonText={translate('common.saveAndContinue')}
                style={[styles.mh5, styles.mt3, styles.flexGrow1]}
                isSubmitButtonVisible={Boolean(selectedPlaidAccountID) && !_.isEmpty(lodashGet(plaidData, 'bankAccounts'))}
            >
                <AddPlaidBankAccount
                    text={translate('bankAccount.plaidBodyCopy')}
                    onSelect={(plaidAccountID) => {
                        ReimbursementAccount.updateReimbursementAccountDraft({plaidAccountID});
                    }}
                    plaidData={plaidData}
                    onExitPlaid={() => BankAccounts.setBankAccountSubStep(null)}
                    receivedRedirectURI={receivedRedirectURI}
                    plaidLinkOAuthToken={plaidLinkOAuthToken}
                    allowDebit
                    bankAccountID={bankAccountID}
                    selectedPlaidAccountID={selectedPlaidAccountID}
                />
                {Boolean(selectedPlaidAccountID) && !_.isEmpty(lodashGet(plaidData, 'bankAccounts')) && (
                    <InputWrapper
                        InputComponent={CheckboxWithLabel}
                        accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.expensifyTermsOfService')}`}
                        style={styles.mt4}
                        inputID="acceptTerms"
                        LabelComponent={() => (
                            <Text>
                                {translate('common.iAcceptThe')}
                                <TextLink href={CONST.TERMS_URL}>{translate('common.expensifyTermsOfService')}</TextLink>
                            </Text>
                        )}
                        defaultValue={getDefaultStateForField('acceptTerms', false)}
                        shouldSaveDraft
                    />
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

BankAccountPlaidStep.propTypes = propTypes;
BankAccountPlaidStep.defaultProps = defaultProps;
BankAccountPlaidStep.displayName = 'BankAccountPlaidStep';
export default compose(
    withLocalize,
    withOnyx({
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
    }),
)(BankAccountPlaidStep);
