import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import CONST from '../../CONST';

class BankAccount {
    static STATE = {
        PENDING: 'PENDING',
        OPEN: 'OPEN',
        DELETED: 'DELETED',
        LOCKED: 'LOCKED',
        SETUP: 'SETUP',
        VERIFYING: 'VERIFYING',
    };

    constructor(accountJSON) {
        this.json = accountJSON;
    }

    /**
     * Return the ID of the reimbursement account
     *
     * @returns {Number}
     */
    getID() {
        return this.json.methodID;
    }

    /**
     * Return the account number, which has been obfuscated by the back end
     * example "XXXXXX3956"
     *
     * @returns {String}
     */
    getMaskedAccountNumber() {
        return this.json.accountData.accountNumber;
    }

    /**
     * Used as the display name for the account...
     * @returns {String}
     */
    getAddressName() {
        return this.json.accountData.addressName;
    }

    /**
     * @returns {String}
     */
    getProcessor() {
        return this.json.accountData.processor;
    }

    /**
     * @returns {String}
     */
    getRoutingNumber() {
        return this.json.accountData.routingNumber;
    }

    /**
     * Get all user emails that have access to this bank account
     * @return {String[]}
     */
    getSharees() {
        return this.json.accountData.sharees;
    }

    /**
     * @returns {String}
     * @private
     */
    getState() {
        return this.json.accountData.state;
    }

    /**
     * @returns {Boolean}
     */
    isOpen() {
        return this.getState() === BankAccount.STATE.OPEN;
    }

    /**
     * @deprecated Use !isPending instead.
     * @returns {Boolean}
     */
    isVerified() {
        return !this.isPending();
    }

    /**
     * If the user still needs to enter the 3 micro deposit amounts.
     * @returns {Boolean}
     */
    isPending() {
        return this.getState() === BankAccount.STATE.PENDING;
    }

    /**
     * If success team is currently verifying the bank account data provided by the user.
     * @returns {Boolean}
     */
    isVerifying() {
        return this.getState() === BankAccount.STATE.VERIFYING;
    }

    /**
     * If the user didn't finish entering all their info.
     * @returns {Boolean}
     */
    isInSetup() {
        return this.getState() === BankAccount.STATE.SETUP;
    }

    /**
     * @returns {Boolean}
     */
    isLocked() {
        return this.getState() === BankAccount.STATE.LOCKED;
    }

    /**
     * Is it the account to use by default to receive money?
     *
     * @returns {Boolean}
     */
    isDefaultCredit() {
        return this.json.accountData.defaultCredit === true;
    }

    /**
     * Can we use this account to pay other people?
     *
     * @returns {Boolean}
     */
    isWithdrawal() {
        return this.json.accountData.allowDebit === true;
    }

    /**
     * Return the client ID of this bank account
     *
     * @NOTE WARNING KEEP IN SYNC WITH THE PHP
     * @returns {String}
     */
    getClientID() {
        // eslint-disable-next-line max-len
        return `${Str.makeID(this.getMaskedAccountNumber())}${Str.makeID(this.getAddressName())}${Str.makeID(this.getRoutingNumber())}${this.getType()}`;
    }

    /**
     * @returns {String}
     * @private
     */
    getType() {
        return this.isWithdrawal() ? 'withdrawal' : 'direct-deposit';
    }

    /**
     * Return the internal json data structure used by auth
     * @returns {Object}
     */
    getJSON() {
        return this.json;
    }

    /**
     * Return whether or not this bank account has been risk checked
     * @returns {Boolean}
     */
    isRiskChecked() {
        return Boolean(this.json.accountData.riskChecked);
    }

    /**
     * Return when the 3 micro amounts for validation were supposed to reach the bank account.
     * @returns {String}
     */
    getValidateCodeExpectedDate() {
        return this.json.validateCodeExpectedDate || '';
    }

    /**
     * In which country is the bank account?
     * @returns {string}
     */
    getCountry() {
        return lodashGet(this.json, ['accountData', 'additionalData', 'country'], CONST.COUNTRY.US);
    }

    /**
     * In which currency is the bank account?
     * @returns {String}
     */
    getCurrency() {
        return lodashGet(this.json, ['accountData', 'additionalData', 'currency'], 'USD');
    }

    /**
     * In which bank is the bank account?
     * @returns {String}
     */
    getBankName() {
        return lodashGet(this.json, ['accountData', 'additionalData', 'bankName'], '');
    }

    /**
     * Did we get bank account details for local transfer or international wire?
     * @returns {Boolean}
     */
    hasInternationalWireDetails() {
        return lodashGet(this.json, ['accountData', 'additionalData', 'fieldsType'], 'local') === 'international';
    }

    /**
     * Get the additional data of a bankAccount
     * @returns {Object}
     */
    getAdditionalData() {
        return this.json.accountData.additionalData || {};
    }

    /**
     * Return a map needed to setup a withdrawal account
     * @returns {Object}
     */
    toACHData() {
        return _.extend({
            routingNumber: this.getRoutingNumber(),
            accountNumber: this.getMaskedAccountNumber(),
            addressName: this.getAddressName(),
            isSavings: this.json.isSavings,
            bankAccountID: this.getID(),
            state: this.getState(),
            validateCodeExpectedDate: this.getValidateCodeExpectedDate(),
            needsToUpgrade: this.needsToUpgrade(),
        }, this.getAdditionalData());
    }

    /**
     * Check if user hasn't upgraded their bank account yet.
     * @return {Boolean}
     */
    needsToUpgrade() {
        return !this.isInSetup() && !lodashHas(this.json, ['accountData', 'additionalData', 'beneficialOwners']);
    }
}

export default BankAccount;
