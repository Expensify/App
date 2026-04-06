import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getOriginalMessage, isMessageDeleted, isMoneyRequestAction, isReportPreviewAction} from '@libs/ReportActionsUtils';
import {canDeleteReportAction} from '@libs/ReportUtils';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction, Transaction} from '@src/types/onyx';

type PopoverDeleteItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverDeleteItem({reportID, reportAction, moneyRequestAction, hideAndRun, isFocused, onFocus, onBlur}: PopoverDeleteItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('common.delete')}
            icon={icons.Trashcan}
            onPress={() => {
                const iouReportID = isMoneyRequestAction(moneyRequestAction) ? getOriginalMessage(moneyRequestAction)?.IOUReportID : undefined;
                const effectiveReportID = iouReportID && Number(iouReportID) !== 0 ? iouReportID : reportID;
                const actionSourceID = effectiveReportID !== reportID ? reportID : undefined;
                hideAndRun(() => showDeleteModal(effectiveReportID, moneyRequestAction ?? reportAction, undefined, undefined, undefined, actionSourceID));
            }}
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE}
        />
    );
}

type MiniDeleteItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    hideAndRun: (callback?: () => void) => void;
};

function MiniDeleteItem({reportID, reportAction, moneyRequestAction, hideAndRun}: MiniDeleteItemProps) {
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

function shouldShowDeleteAction({
    reportAction,
    isArchivedRoom,
    isChronosReport,
    reportID,
    moneyRequestAction,
    iouTransaction,
    transactions,
    childReportActions,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    reportID: string | undefined;
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    transactions: OnyxCollection<Transaction> | undefined;
    childReportActions: OnyxCollection<ReportAction>;
}): boolean {
    let effectiveReportID: string | undefined = reportID;
    if (isMoneyRequestAction(moneyRequestAction)) {
        effectiveReportID = getOriginalMessage(moneyRequestAction)?.IOUReportID;
    } else if (isReportPreviewAction(reportAction)) {
        effectiveReportID = reportAction?.childReportID;
    }
    return (
        !!reportID &&
        canDeleteReportAction(moneyRequestAction ?? reportAction, effectiveReportID, iouTransaction, transactions, childReportActions) &&
        !isArchivedRoom &&
        !isChronosReport &&
        !isMessageDeleted(reportAction)
    );
}

export {shouldShowDeleteAction, PopoverDeleteItem, MiniDeleteItem};
