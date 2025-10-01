import type {OnyxEntry} from 'react-native-onyx';
import type {Policy} from '@src/types/onyx';

export default function getUberConnectionErrorDirectlyFromPolicy(policy: OnyxEntry<Policy>) {
    const receiptUber = policy?.receiptPartners?.uber;
    const isReceiptUberConnected = !!policy?.receiptPartners?.uber?.enabled;

    return isReceiptUberConnected && !!receiptUber?.error;
}
