import type {RefObject} from 'react';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isActionOfType, isMessageDeleted, isReportActionAttachment} from '@libs/ReportActionsUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type PopoverCopyLinkItemProps = {
    reportAction: ReportAction;
    originalReportID: string | undefined;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverCopyLinkItem({reportAction, originalReportID, isFocused, onFocus, onBlur}: PopoverCopyLinkItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy', 'Checkmark'] as const);

    return (
        <ContextMenuItem
            text={translate('reportActionContextMenu.copyLink')}
            icon={icons.LinkCopy}
            successIcon={icons.Checkmark}
            successText={translate('reportActionContextMenu.copied')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    getEnvironmentURL().then((environmentURL) => {
                        const reportActionID = reportAction?.reportActionID;
                        Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
                    });
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            isAnonymousAction
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK}
        />
    );
}

type MiniCopyLinkItemProps = {
    reportAction: ReportAction;
    originalReportID: string | undefined;
};

function MiniCopyLinkItem({reportAction, originalReportID}: MiniCopyLinkItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy', 'Checkmark'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.copyLink')}
            icon={icons.LinkCopy}
            successIcon={icons.Checkmark}
            successTooltipText={translate('reportActionContextMenu.copied')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    getEnvironmentURL().then((environmentURL) => {
                        const reportActionID = reportAction?.reportActionID;
                        Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
                    });
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK}
        />
    );
}

function shouldShowCopyLinkAction({reportAction, menuTarget}: {reportAction: OnyxEntry<ReportAction>; menuTarget: RefObject<ContextMenuAnchor> | undefined}): boolean {
    const isAttachment = isReportActionAttachment(reportAction);
    const isAttachmentTarget = menuTarget?.current && 'tagName' in menuTarget.current && menuTarget?.current.tagName === 'IMG' && isAttachment;
    const isDEWRouted = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
    return !isAttachmentTarget && !isMessageDeleted(reportAction) && !isDEWRouted;
}

export {shouldShowCopyLinkAction, PopoverCopyLinkItem, MiniCopyLinkItem};
