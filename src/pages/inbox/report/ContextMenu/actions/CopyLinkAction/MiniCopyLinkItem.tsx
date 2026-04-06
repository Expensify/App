import React from 'react';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type MiniCopyLinkItemProps = {
    reportAction: ReportAction;
    originalReportID: string | undefined;
};

export default function MiniCopyLinkItem({reportAction, originalReportID}: MiniCopyLinkItemProps) {
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
