import RNFS from 'react-native-fs';
import type {OnyxEntry} from 'react-native-onyx';
import type Beta from '@src/types/onyx/Beta';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import handleFileRetry from './handleFileRetry';

export default function handleRetryPress(message: ReceiptError, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void, allBetas: OnyxEntry<Beta[]>) {
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
            handleFileRetry(message, file, dismissError, setShouldShowErrorModal, allBetas);
        })
        .catch(() => {
            setShouldShowErrorModal(true);
        });
}
