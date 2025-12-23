import {NativeEventEmitter, Platform} from 'react-native';
import TaskManager from '@expensify/react-native-background-task';
import Log from '@libs/Log';

type UploadOptions = {
    url: string;
    filePath: string;
    fileName?: string;
    mimeType?: string;
    transactionID?: string;
    fields?: Record<string, string>;
    headers?: Record<string, string>;
};

let unsubscribeUploadEvents: (() => void) | undefined;

function ensureSubscribed() {
    if (unsubscribeUploadEvents || Platform.OS !== 'android') {
        return;
    }
    unsubscribeUploadEvents = subscribeToBackgroundReceiptUpload((result) => {
        Log.info('[BackgroundReceiptUpload] Received native upload result', false, result);
    });
}

/**
 * Starts a background receipt upload on Android using the native background-task module.
 * On other platforms, this resolves immediately.
 */
function startBackgroundReceiptUpload(options: UploadOptions): Promise<void> {
    if (Platform.OS !== 'android') {
        return Promise.resolve();
    }

    const {url, filePath, fileName = '', mimeType = 'application/octet-stream', transactionID = '', fields = {}, headers = {}} = options;
    ensureSubscribed();
    Log.info('[BackgroundReceiptUpload] Enqueue upload', false, {url, filePath, transactionID});
    return TaskManager.startReceiptUpload({
        url,
        filePath,
        fileName,
        mimeType,
        transactionID,
        fields,
        headers,
    }).catch((error) => {
        Log.hmmm('[BackgroundReceiptUpload] Failed to enqueue upload', {error});
        throw error;
    });
}

/**
 * Listen for background upload results emitted from the native module.
 */
function subscribeToBackgroundReceiptUpload(callback: (result: {transactionID?: string; success: boolean; code: number; message?: string}) => void) {
    if (Platform.OS !== 'android') {
        return () => {};
    }
    const eventEmitter = new NativeEventEmitter(TaskManager as unknown as {addListener: (...args: unknown[]) => unknown});
    const subscription = eventEmitter.addListener('onReceiptUploadResult', (result) => {
        Log.info('[BackgroundReceiptUpload] Upload result', false, result);
        callback(result);
    });
    return () => subscription.remove();
}

export {startBackgroundReceiptUpload, subscribeToBackgroundReceiptUpload};
