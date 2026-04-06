import React from 'react';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type MiniDeleteItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniDeleteItem({reportID, reportAction, moneyRequestAction, hideAndRun}: MiniDeleteItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('common.delete')}
            icon={icons.Trashcan}
            onPress={() => {
                const iouReportID = isMoneyRequestAction(moneyRequestAction) ? getOriginalMessage(moneyRequestAction)?.IOUReportID : undefined;
                const effectiveReportID = iouReportID && Number(iouReportID) !== 0 ? iouReportID : reportID;
                const actionSourceID = effectiveReportID !== reportID ? reportID : undefined;
                hideAndRun(() => showDeleteModal(effectiveReportID, moneyRequestAction ?? reportAction, undefined, undefined, undefined, actionSourceID));
            }}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE}
        />
    );
}
