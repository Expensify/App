import React from 'react';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {CopyMessageClipboardParams} from './copyMessageAction';
import {copyMessageToClipboard} from './copyMessageAction';

type MiniCopyMessageItemProps = Omit<CopyMessageClipboardParams, 'translate'>;

export default function MiniCopyMessageItem({
    reportAction,
    transaction,
    selection,
    report,
    conciergeReportID,
    bankAccountList,
    card,
    originalReport,
    isHarvestReport,
    isTryNewDotNVPDismissed,
    movedFromReport,
    movedToReport,
    childReport,
    policy,
    getLocalDateFromDatetime,
    policyTags,
    harvestReport,
    currentUserPersonalDetails,
}: MiniCopyMessageItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.copyMessage')}
            icon={icons.Copy}
            successIcon={icons.Checkmark}
            successTooltipText={translate('reportActionContextMenu.copied')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    copyMessageToClipboard({
                        reportAction,
                        transaction,
                        selection,
                        report,
                        conciergeReportID,
                        bankAccountList,
                        card,
                        originalReport,
                        isHarvestReport,
                        isTryNewDotNVPDismissed,
                        movedFromReport,
                        movedToReport,
                        childReport,
                        policy,
                        getLocalDateFromDatetime,
                        policyTags,
                        translate,
                        harvestReport,
                        currentUserPersonalDetails,
                    });
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE}
        />
    );
}
