import {useCallback} from 'react';
import {Keyboard} from 'react-native';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import {getFileName} from '@libs/fileDownload/FileUtils';
import type {DownloadAttachmentCallback} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import CONST from '@src/CONST';

type UseDownloadAttachmentProps = {
    isAuthTokenRequired?: boolean;
    type?: string;
    draftTransactionID?: string;
};

function useDownloadAttachment({isAuthTokenRequired, type, draftTransactionID}: UseDownloadAttachmentProps) {
    /**
     * Download the currently viewed attachment.
     */
    const downloadAttachment = useCallback<DownloadAttachmentCallback>(
        ({source, file}) => {
            let sourceURL = source;
            if (isAuthTokenRequired && typeof sourceURL === 'string') {
                sourceURL = addEncryptedAuthTokenToURL(sourceURL);
            }

            if (typeof sourceURL === 'string') {
                const fileName = type === CONST.ATTACHMENT_TYPE.SEARCH ? getFileName(`${sourceURL}`) : file?.name;
                const shouldUnlink = !draftTransactionID;
                fileDownload(sourceURL, fileName ?? '', undefined, undefined, undefined, undefined, undefined, shouldUnlink);
            }

            // At ios, if the keyboard is open while opening the attachment, then after downloading
            // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
            Keyboard.dismiss();
        },
        [isAuthTokenRequired, type, draftTransactionID],
    );

    return downloadAttachment;
}

export default useDownloadAttachment;
export type {UseDownloadAttachmentProps};
