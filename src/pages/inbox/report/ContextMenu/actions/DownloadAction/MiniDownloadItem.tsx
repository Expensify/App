import React from 'react';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {setDownload} from '@userActions/Download';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias -- subdirectory relative to actions/actionConfig
import {getActionHtml} from '../actionConfig';

type MiniDownloadItemProps = {
    reportAction: ReportAction;
    encryptedAuthToken: string;
};

export default function MiniDownloadItem({reportAction, encryptedAuthToken}: MiniDownloadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Download'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('common.download')}
            icon={icons.Download}
            successIcon={icons.Download}
            successTooltipText={translate('common.download')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    const html = getActionHtml(reportAction);
                    const {originalFileName, sourceURL} = getAttachmentDetails(html);
                    const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL ?? '', encryptedAuthToken);
                    const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT.ATTACHMENT_SOURCE_ID) ?? [])[1];
                    setDownload(sourceID, true);
                    const anchorRegex = CONST.REGEX_LINK_IN_ANCHOR;
                    const isAnchorTag = anchorRegex.test(html);
                    fileDownload(translate, sourceURLWithAuth, originalFileName ?? '', '', isAnchorTag && isMobileSafari()).then(() => setDownload(sourceID, false));
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DOWNLOAD}
        />
    );
}
