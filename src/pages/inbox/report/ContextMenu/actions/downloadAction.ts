import type {OnyxEntry} from 'react-native-onyx';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {setDownload} from '@userActions/Download';
import CONST from '@src/CONST';
import type {Download as DownloadOnyx, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import {getActionHtml} from './actionConfig';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type DownloadActionParams = BaseContextMenuActionParams & {
    reportAction: ReportAction;
    encryptedAuthToken: string;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    download: OnyxEntry<DownloadOnyx>;
    downloadIcon: IconAsset;
};

function createDownloadAction({reportAction, encryptedAuthToken, interceptAnonymousUser, download, translate, downloadIcon}: DownloadActionParams): ContextMenuAction {
    const isDownloading = download?.isDownloading ?? false;

    return {
        id: 'download',
        icon: downloadIcon,
        text: translate('common.download'),
        successText: translate('common.download'),
        successIcon: downloadIcon,
        isAnonymousAction: true,
        disabled: isDownloading,
        shouldShowLoadingSpinnerIcon: isDownloading,
        onPress: () =>
            interceptAnonymousUser(() => {
                const html = getActionHtml(reportAction);
                const {originalFileName, sourceURL} = getAttachmentDetails(html);
                const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL ?? '', encryptedAuthToken);
                const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
                setDownload(sourceID, true);
                const anchorRegex = CONST.REGEX_LINK_IN_ANCHOR;
                const isAnchorTag = anchorRegex.test(html);
                fileDownload(translate, sourceURLWithAuth, originalFileName ?? '', '', isAnchorTag && isMobileSafari()).then(() => setDownload(sourceID, false));
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DOWNLOAD,
    };
}

export default createDownloadAction;
export type {DownloadActionParams};
