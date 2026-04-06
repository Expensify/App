import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getReportAction} from '@libs/ReportActionsUtils';
import {canHoldUnholdReportAction, changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Policy, ReportAction, Report as ReportType, Transaction} from '@src/types/onyx';

type PopoverUnholdItemProps = {
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    isOffline: boolean;
    isDelegateAccessRestricted: boolean;
    showDelegateNoAccessModal: (() => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverUnholdItem({
    moneyRequestAction,
    iouTransaction,
    isOffline,
    isDelegateAccessRestricted,
    showDelegateNoAccessModal,
    hideAndRun,
    isFocused,
    onFocus,
    onBlur,
}: PopoverUnholdItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('iou.unhold')}
            icon={icons.Stopwatch}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (isDelegateAccessRestricted) {
                        hideContextMenu(false, showDelegateNoAccessModal);
                        return;
                    }
                    hideAndRun(() => changeMoneyRequestHoldStatus(moneyRequestAction, iouTransaction, isOffline));
                }, false)
            }
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.UNHOLD}
        />
    );
}

type MiniUnholdItemProps = {
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    isOffline: boolean;
    isDelegateAccessRestricted: boolean;
    showDelegateNoAccessModal: (() => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
};

function MiniUnholdItem({moneyRequestAction, iouTransaction, isOffline, isDelegateAccessRestricted, showDelegateNoAccessModal, hideAndRun}: MiniUnholdItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('iou.unhold')}
            icon={icons.Stopwatch}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (isDelegateAccessRestricted) {
                        hideContextMenu(false, showDelegateNoAccessModal);
                        return;
                    }
                    hideAndRun(() => changeMoneyRequestHoldStatus(moneyRequestAction, iouTransaction, isOffline));
                }, false)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.UNHOLD}
        />
    );
}

function shouldShowUnholdAction({
    moneyRequestReport,
    moneyRequestAction,
    moneyRequestPolicy,
    areHoldRequirementsMet,
    iouTransaction,
}: {
    moneyRequestReport: OnyxEntry<ReportType>;
    moneyRequestAction: ReportAction | undefined;
    moneyRequestPolicy: OnyxEntry<Policy>;
    areHoldRequirementsMet: boolean;
    iouTransaction: OnyxEntry<Transaction>;
}): boolean {
    if (!areHoldRequirementsMet) {
        return false;
    }
    const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
    return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canUnholdRequest;
}

export {shouldShowUnholdAction, PopoverUnholdItem, MiniUnholdItem};
