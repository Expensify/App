import type {UserWallet} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const tierNameSelector = (wallet: OnyxEntry<UserWallet>) => wallet?.tierName;

// eslint-disable-next-line import/prefer-default-export
export {tierNameSelector};
