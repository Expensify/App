import type {ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {BankAccountList, CardList, FundList, UserWallet, WalletTerms, WalletTransfer} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

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

type FormattedSelectedPaymentMethodIcon = {
    icon: IconAsset;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: ViewStyle[];
    iconSize?: number;
};

export type {WalletPageOnyxProps, WalletPageProps, FormattedSelectedPaymentMethodIcon};
