/** Model of verification data for bank accounts and reimbursement accounts */
type AccountVerifications = {
    /** Black listed status */
    blackListed?: unknown;
    /** Is bank account copy */
    isBankAccountCopy?: boolean;
    /** Is blacklisted address */
    isBlackListedAddress?: boolean;
    /** Is blacklisted name */
    isBlackListedName?: boolean;
    /** Is blacklisted user */
    isBlackListedUser?: boolean;
    /** Is flagged */
    isFlagged?: boolean;
};

export default AccountVerifications;