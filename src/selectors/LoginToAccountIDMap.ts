import type {LoginToAccountIDMapDerivedValue} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const accountIDSelector = (login: string | undefined) => (loginToAccountIDMap: OnyxEntry<LoginToAccountIDMapDerivedValue>) => (login ? loginToAccountIDMap?.[login] : undefined);

export {accountIDSelector};
