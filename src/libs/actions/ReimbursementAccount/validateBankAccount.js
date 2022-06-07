import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as DeprecatedAPI from '../../deprecatedAPI';
import BankAccount from '../../models/BankAccount';
import CONST from '../../../CONST';
import * as Localize from '../../Localize';
import * as errors from './errors';

/**
 * @param {Number} bankAccountID
 * @param {String} validateCode
 */
function validateBankAccount(bankAccountID, validateCode) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true});

    DeprecatedAPI.BankAccount_Validate({bankAccountID, validateCode})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, null);
                DeprecatedAPI.User_IsUsingExpensifyCard()
                    .then(({isUsingExpensifyCard}) => {
                        const reimbursementAccount = {
                            loading: false,
                            error: '',
                            achData: {state: BankAccount.STATE.OPEN},
                        };

                        reimbursementAccount.achData.currentStep = CONST.BANK_ACCOUNT.STEP.ENABLE;
                        Onyx.merge(ONYXKEYS.USER, {isUsingExpensifyCard});
                        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, reimbursementAccount);
                    });
                return;
            }

            // User has input the validate code incorrectly many times so we will return early in this case and not let them enter the amounts again.
            if (response.message === CONST.BANK_ACCOUNT.ERROR.MAX_VALIDATION_ATTEMPTS_REACHED) {
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false, maxAttemptsReached: true});
                return;
            }

            // If the validation amounts entered were incorrect, show specific error
            if (response.message === CONST.BANK_ACCOUNT.ERROR.INCORRECT_VALIDATION_AMOUNTS) {
                errors.showBankAccountErrorModal(Localize.translateLocal('bankAccount.error.validationAmounts'));
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                return;
            }

            // We are generically showing any other backend errors that might pop up in the validate step
            errors.showBankAccountErrorModal(response.message);
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
}

export default validateBankAccount;
