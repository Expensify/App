import Str from 'expensify-common/lib/str';
import CONST from '../../CONST';
import { ValueOf } from "type-fest";
import BankAccountJSON, {AdditionalData} from "../../types/onyx/BankAccount";

type State = ValueOf<typeof BankAccount.STATE>;

type BankAccountType = "withdrawal" | "direct-deposit";

type ACHData = {
    routingNumber: string,
    accountNumber: string,
    addressName: string,
    isSavings: boolean,
    bankAccountID: number,
    state: State,
    validateCodeExpectedDate: string,
    needsToUpgrade: boolean,
};

class BankAccount {
    public static readonly STATE = {
        PENDING: 'PENDING',
        OPEN: 'OPEN',
        DELETED: 'DELETED',
        LOCKED: 'LOCKED',
        SETUP: 'SETUP',
        VERIFYING: 'VERIFYING',
    };
    private readonly json: BankAccountJSON;
    constructor(accountJSON: BankAccountJSON) {
        this.json = accountJSON;
    }

    /**
     * @returns - the ID of the reimbursement account
     */
    getID(): number | undefined {
        return this.json.methodID;
    }

    /**
     * @returns - account number obfuscated by the backend.
     * @example "XXXXXX3956"
     */
    getMaskedAccountNumber(): string | undefined {
        return this.json.accountData?.accountNumber;
    }

    /**
     * @returns - the display name for the account.
     */
    getAddressName(): string | undefined {
        return this.json.accountData?.addressName;
    }

    /**
     * @returns - processor of the bank account.
     */
    getProcessor(): string | undefined {
        return this.json.accountData?.processor;
    }

    /**
     * @returns - routing number of the bank account.
     */
    getRoutingNumber(): string | undefined {
        return this.json.accountData?.routingNumber;
    }

    /**
     * @return - all user emails that have access to this bank account.
     */
    getSharees(): string[] | undefined {
        return this.json.accountData?.sharees;
    }

    /**
     * @returns - current state of the bank account.
     * @private
     */
    private getState(): State | undefined {
        return this.json.accountData?.state;
    }

    /**
     * @returns - if the bank account is open.
     */
    isOpen(): boolean {
        return this.getState() === BankAccount.STATE.OPEN;
    }

    /**
     * @deprecated Use !isPending instead.
     * @returns - if the bank account is verified.
     */
    isVerified(): boolean {
        return !this.isPending();
    }

    /**
     * @returns - if he user still needs to enter the 3 micro deposit amounts.
     */
    isPending(): boolean {
        return this.getState() === BankAccount.STATE.PENDING;
    }

    /**
     * @returns - if success team is currently verifying the bank account data provided by the user.
     */
    isVerifying(): boolean {
        return this.getState() === BankAccount.STATE.VERIFYING;
    }

    /**
     * @returns - if the user didn't finish entering all their info.
     */
    isInSetup(): boolean {
        return this.getState() === BankAccount.STATE.SETUP;
    }

    /**
     * @returns - if the bank account is locked.
     */
    isLocked(): boolean {
        return this.getState() === BankAccount.STATE.LOCKED;
    }

    /**
     * @returns - if the account is the default credit account.
     */
    isDefaultCredit(): boolean | undefined {
        return this.json.accountData?.defaultCredit;
    }

    /**
     * @returns - if the account can be used for paying other people.
     */
    isWithdrawal(): boolean | undefined {
        return this.json.accountData?.allowDebit;
    }

    /**
     * @NOTE WARNING KEEP IN SYNC WITH THE PHP
     * @returns - client ID of the bank account.
     */
    getClientID() {
        // eslint-disable-next-line max-len
        return `${Str.makeID(this.getMaskedAccountNumber() || "")}${Str.makeID(this.getAddressName() || "")}${Str.makeID(this.getRoutingNumber() || "")}${this.getType()}`;
    }

    /**
     * @returns - type of the bank account.
     * @private
     */
    private getType(): BankAccountType {
        return this.isWithdrawal() ? 'withdrawal' : 'direct-deposit';
    }

    /**
     * @returns - Return the internal json data structure used by auth.
     */
    getJSON(): BankAccountJSON {
        return this.json;
    }

    /**
     * @returns - Whether or not this bank account has been risk checked
     */
    isRiskChecked(): boolean | undefined {
        return this.json.accountData?.riskChecked;
    }

    /**
     * @returns - date when the 3 micro amounts for validation were supposed to reach the bank account.
     */
    getValidateCodeExpectedDate(): string {
        return this.json.validateCodeExpectedDate || '';
    }

    /**
     * @returns - country of the bank account.
     */
    getCountry(): string {
        return this.json.accountData?.additionalData?.country as string || CONST.COUNTRY.US;
    }

    /**
     * @returns - currency of the bank account.
     */
    getCurrency(): string {
        return this.json.accountData?.additionalData?.currency as string || "USD";
    }

    /**
     * @returns - bank name of the bank account.
     */
    getBankName(): string {
        return this.json.accountData?.additionalData?.bankName as string || "";
    }

    /**
     * @returns - Information if did we get bank account details for local transfer or international wire.
     */
    hasInternationalWireDetails(): boolean {
        return this.json.accountData?.additionalData?.fieldsType as string === 'international';
    }

    /**
     * @returns - Additional data of a bankAccount.
     */
    getAdditionalData(): Partial<AdditionalData> {
        return this.json.accountData?.additionalData || {};
    }

    /**
     * @returns - A map needed to set up a withdrawal account.
     */
    toACHData(): Partial<ACHData & AdditionalData> {
        return {
            routingNumber: this.getRoutingNumber(),
            accountNumber: this.getMaskedAccountNumber(),
            addressName: this.getAddressName(),
            isSavings: this.json.accountData?.isSavings,
            bankAccountID: this.getID(),
            state: this.getState(),
            validateCodeExpectedDate: this.getValidateCodeExpectedDate(),
            needsToUpgrade: this.needsToUpgrade(),
            ...this.getAdditionalData(),
        };
    }

    /**
     * @returns - Information if user hasn't upgraded their bank account yet.
     */
    needsToUpgrade(): boolean {
        return !this.isInSetup() && !this.json?.accountData?.additionalData?.beneficialOwners;
    }
}

export default BankAccount;
