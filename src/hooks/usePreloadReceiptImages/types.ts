import type {OnyxEntry} from 'react-native-onyx';
import type Transaction from '@src/types/onyx/Transaction';

type UsePreloadReceiptImages = (transactions: Array<OnyxEntry<Transaction>>, encryptedAuthToken: string | undefined) => void;

export default UsePreloadReceiptImages;
