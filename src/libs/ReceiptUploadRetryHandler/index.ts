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

    fetch(message.source)
        .then((res) => res.blob())
        .then((blob) => {
            const reconstructedFile = new File([blob], message.filename);
            reconstructedFile.uri = message.source;
            reconstructedFile.source = message.source;
            handleFileRetry(message, reconstructedFile, dismissError, setShouldShowErrorModal, allTransactionDrafts);
        })
        .catch(() => {
            setShouldShowErrorModal(true);
        });
}
