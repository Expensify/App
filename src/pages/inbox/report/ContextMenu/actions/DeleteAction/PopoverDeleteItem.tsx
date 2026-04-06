import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type PopoverDeleteItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverDeleteItem({reportID, reportAction, moneyRequestAction, hideAndRun, isFocused, onFocus, onBlur}: PopoverDeleteItemProps) {
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
