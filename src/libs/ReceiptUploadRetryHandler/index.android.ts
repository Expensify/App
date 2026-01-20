import RNFS from 'react-native-fs';
import type {OnyxCollection} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import handleFileRetry from './handleFileRetry';

export default function handleRetryPress(
    message: ReceiptError,
    dismissError: () => void,
    setShouldShowErrorModal: (value: boolean) => void,
    allTransactionDrafts: OnyxCollection<OnyxTypes.Transaction>,
) {
    if (!message.source) {
        return;
    }
    // Android-specific logic using RNFS
    const filePath = message.source.replace('file://', '');
    RNFS.readFile(filePath, 'base64')
        .then((fileContent) => {
            const file = new File([fileContent], message.filename, {type: 'image/jpeg'});
            file.uri = message.source;
            file.source = message.source;
            handleFileRetry(message, file, dismissError, setShouldShowErrorModal, allTransactionDrafts);
        })
        .catch(() => {
            setShouldShowErrorModal(true);
        });
}
