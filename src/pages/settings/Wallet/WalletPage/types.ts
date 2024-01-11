import type {OnyxEntry} from 'react-native-onyx';
import type {BankAccountList, CardList, FundList, UserWallet, WalletTerms, WalletTransfer} from '@src/types/onyx';

type WalletPageOnyxProps = {
    /** Wallet balance transfer props */
    walletTransfer: OnyxEntry<WalletTransfer>;

    /** The user's wallet account */
    userWallet: OnyxEntry<UserWallet>;

    /** List of bank accounts */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** List of user's cards */
    fundList: OnyxEntry<FundList>;

    /** Information about the user accepting the terms for payments */
    walletTerms: OnyxEntry<WalletTerms>;

    cardList: OnyxEntry<CardList>;

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: OnyxEntry<boolean>;
};

type WalletPageProps = WalletPageOnyxProps & {
    /** Listen for window resize event on web and desktop. */
    shouldListenForResize?: boolean;
};

export type {WalletPageOnyxProps, WalletPageProps};
