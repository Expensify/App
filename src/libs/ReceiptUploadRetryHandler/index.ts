import type {OnyxEntry} from 'react-native-onyx';
import type Beta from '@src/types/onyx/Beta';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import handleFileRetry from './handleFileRetry';

export default function handleRetryPress(message: ReceiptError, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void, allBetas: OnyxEntry<Beta[]>) {
    if (!message.source) {
        return;
    }

    fetch(message.source)
        .then((res) => res.blob())
        .then((blob) => {
            const reconstructedFile = new File([blob], message.filename);
            reconstructedFile.uri = message.source;
            reconstructedFile.source = message.source;
            handleFileRetry(message, reconstructedFile, dismissError, setShouldShowErrorModal, allBetas);
        })
        .catch(() => {
            setShouldShowErrorModal(true);
        });
}
