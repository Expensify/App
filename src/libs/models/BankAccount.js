import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';

let currentUserLogin;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val && val.email,
});

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
        return this.json.bankAccountID;
    }

    /**
     * Return the account number, which has been obfuscate by the back end
     * example "XXXXXX3956"
     *
     * @returns {String}
     */
    getMaskedAccountNumber() {
        return this.json.accountNumber;
    }

    /**
     * Used as the display name for the account...
     * @returns {String}
     */
    getAddressName() {
        return this.json.addressName;
    }

    /**
     * @returns {String}
     */
    getProcessor() {
        return this.json.processor;
    }

    /**
     * @returns {String}
     */
    getRoutingNumber() {
        return this.json.routingNumber;
    }

    /**
     * Get all user emails having access to this bank account
     * @return {String[]}
     */
    getSharees() {
        return this.json.sharees;
    }

    /**
     * @returns {String}
     * @private
     */
    getState() {
        return this.json.state;
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
        return Boolean(this.json.validating) || this.getState() === BankAccount.STATE.VERIFYING;
    }

    /**
     * If the user didn't finish entering all his info.
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
     * If someone asked to share the bank account with me, and the request is still pending
     * @returns {Boolean}
     */
    isSharePending() {
        return Boolean(this.json.shareComplete === false && this.getOwner() !== currentUserLogin);
    }

    /**
     * Who shared this account with me?
     * @returns {String}
     */
    getOwner() {
        return this.json.ownedBy;
    }

    /**
     * Is it the account to use by default to receive money?
     *
     * @returns {Boolean}
     */
    isDefaultCredit() {
        return this.json.defaultCredit === true;
    }

    /**
     * Can we use this account to pay other people?
     *
     * @returns {Boolean}
     */
    isWithdrawal() {
        return this.json.allowDebit === true;
    }

    /**
     * Get when the user last updated their bank account.
     * @return {*|String}
     */
    getDateSigned() {
        return lodashGet(this.json, ['additionalData', 'dateSigned']) || '';
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
        return Boolean(this.json.riskChecked);
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
        return lodashGet(this.json, ['additionalData', 'country'], CONST.COUNTRY.US);
    }

    /**
     * In which currency is the bank account?
     * @returns {String}
     */
    getCurrency() {
        return lodashGet(this.json, ['additionalData', 'currency'], 'USD');
    }

    /**
     * In which bank is the bank account?
     * @returns {String}
     */
    getBankName() {
        return lodashGet(this.json, ['additionalData', 'bankName'], lodashGet(this.json, 'bankName'));
    }

    /**
     * Did we get bank account details for local transfer or international wire?
     * @returns {Boolean}
     */
    hasInternationalWireDetails() {
        return lodashGet(this.json, ['additionalData', 'fieldsType'], 'local') === 'international';
    }

    /**
     * Get the additional data of a bankAccount
     * @returns {Object}
     */
    getAdditionalData() {
        return this.json.additionalData || {};
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
            needsToPassLatestChecks: this.needsToPassLatestChecks(),
            needsToUpgrade: this.needsToUpgrade(),
        }, this.getAdditionalData());
    }


    /**
     * Check if user hasn't upgraded their bank account yet.
     * @return {Boolean}
     */
    needsToUpgrade() {
        return !this.isInSetup() && !lodashHas(this.json, ['additionalData', 'beneficialOwners']);
    }

    /**
     * Check if we've performed the most recently implemented checks on the bank account, and they all passed.
     * Same logic as in BankAccount.php needsToPassLatestChecks
     * @return {Boolean}
     */
    needsToPassLatestChecks() {
        if (!lodashGet(this.json, ['additionalData', 'hasFullSSN'])) {
            return true;
        }

        const beneficialOwners = lodashGet(this.json, ['additionalData', 'beneficialOwners']);
        if (!beneficialOwners) {
            return true;
        }

        const city = lodashGet(this.json, ['additionalData', 'requestorAddressCity']);
        if (!city) {
            return true;
        }

        if (_.isArray(beneficialOwners)) {
            const hasBeneficialOwnerError = _.any(beneficialOwners, (beneficialOwner) => {
                const hasFullSSN = lodashGet(beneficialOwner, 'hasFullSSN')
                    || !_.isEmpty(lodashGet(beneficialOwner, 'ssn'));
                return !lodashGet(beneficialOwner, 'isRequestor')
                    && (lodashGet(beneficialOwner, ['expectIDPA', 'status']) !== 'pass'
                        || !lodashGet(beneficialOwner, 'city') || !hasFullSSN
                    );
            });
            if (hasBeneficialOwnerError) {
                return true;
            }
        }

        return _.any(['realSearchResult', 'lexisNexisInstantIDResult', 'requestorIdentityID'], field => (
            lodashGet(this.json, [
                'additionalData', 'verifications', 'externalApiResponses', field, 'status',
            ]) !== 'pass'
        ));
    }
}

export default BankAccount;
