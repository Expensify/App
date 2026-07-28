type WalletStatementProps = {
    /** URL for oldDot (expensify.com) statements page to display */
    statementPageURL: string;
};

type WalletStatementMessage = {
    url: string;
    type: string;
};

export type {WalletStatementProps, WalletStatementMessage};
