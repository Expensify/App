import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {setDownload} from '@userActions/Download';
import CONST from '@src/CONST';
import {getActionHtml} from './actionConfig';

function Download({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportAction, encryptedAuthToken, isMini, interceptAnonymousUser, download} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Download'] as const);
    const {translate} = useLocalize();

    const closePopover = !isMini;
    const isDownloading = download?.isDownloading ?? false;

    const handlePress = () => {
        const html = getActionHtml(reportAction);
        const {originalFileName, sourceURL} = getAttachmentDetails(html);
        const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL ?? '', encryptedAuthToken);
        const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
        setDownload(sourceID, true);
        const anchorRegex = CONST.REGEX_LINK_IN_ANCHOR;
        const isAnchorTag = anchorRegex.test(html);
        fileDownload(translate, sourceURLWithAuth, originalFileName ?? '', '', isAnchorTag && isMobileSafari()).then(() => setDownload(sourceID, false));
        if (closePopover) {
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        }
    };

    return (
        <ContextMenuItem
            icon={icons.Download}
            text={translate('common.download')}
            successText={translate('common.download')}
            successIcon={icons.Download}
            isMini={isMini}
            disabled={isDownloading}
            shouldShowLoadingSpinnerIcon={isDownloading}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DOWNLOAD}
        />
    );
}

export default Download;
