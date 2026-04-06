import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isMessageDeleted, isReportActionAttachment} from '@libs/ReportActionsUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {setDownload} from '@userActions/Download';
import CONST from '@src/CONST';
import type {Download as DownloadOnyx, ReportAction} from '@src/types/onyx';
import {getActionHtml} from './actionConfig';

type PopoverDownloadItemProps = {
    reportAction: ReportAction;
    encryptedAuthToken: string;
    download: OnyxEntry<DownloadOnyx>;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverDownloadItem({reportAction, encryptedAuthToken, download, isFocused, onFocus, onBlur}: PopoverDownloadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Download'] as const);
    const isDownloading = download?.isDownloading ?? false;

    return (
        <ContextMenuItem
            text={translate('common.download')}
            icon={icons.Download}
            successText={translate('common.download')}
            successIcon={icons.Download}
            onPress={() =>
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
                }, true)
            }
            isAnonymousAction
            disabled={isDownloading}
            shouldShowLoadingSpinnerIcon={isDownloading}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DOWNLOAD}
        />
    );
}

type MiniDownloadItemProps = {
    reportAction: ReportAction;
    encryptedAuthToken: string;
};

function MiniDownloadItem({reportAction, encryptedAuthToken}: MiniDownloadItemProps) {
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
                    const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
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

function shouldShowDownloadAction({reportAction, isOffline}: {reportAction: OnyxEntry<ReportAction>; isOffline: boolean}): boolean {
    const isAttachment = isReportActionAttachment(reportAction);
    const html = getActionHtml(reportAction);
    const isUploading = html.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
    return isAttachment && !isUploading && !!reportAction?.reportActionID && !isMessageDeleted(reportAction) && !isOffline;
}

export {shouldShowDownloadAction, PopoverDownloadItem, MiniDownloadItem};
