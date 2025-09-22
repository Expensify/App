import type {OnyxEntry} from 'react-native-onyx';
import type {UserWallet} from '@src/types/onyx';

const userWalletTierNameSelector = (wallet: OnyxEntry<UserWallet>) => wallet?.tierName;

// eslint-disable-next-line import/prefer-default-export
export {userWalletTierNameSelector};
