import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {setDownload} from '@userActions/Download';
import CONST from '@src/CONST';
import {getActionHtml} from './actionConfig';
import type {ActionDescriptor} from './ActionDescriptor';

function useDownloadAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {reportAction, encryptedAuthToken, interceptAnonymousUser, download, translate: payloadTranslate} = useContextMenuPayload(payloadOverride);
    const icons = useMemoizedLazyExpensifyIcons(['Download'] as const);
    const {translate} = useLocalize();

    const isDownloading = download?.isDownloading ?? false;

    return {
        id: 'download',
        icon: icons.Download,
        text: translate('common.download'),
        successText: translate('common.download'),
        successIcon: icons.Download,
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
                fileDownload(payloadTranslate, sourceURLWithAuth, originalFileName ?? '', '', isAnchorTag && isMobileSafari()).then(() => setDownload(sourceID, false));
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DOWNLOAD,
    };
}

export default useDownloadAction;
