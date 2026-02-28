import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';

function LeaveThread({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportAction, originalReport, currentUserAccountID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Exit'] as const);

    const closePopover = !isMini;

    const handlePress = () => {
        const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
        if (closePopover) {
            hideContextMenu(false, () => {
                ReportActionComposeFocusManager.focus();
                toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
            });
            return;
        }
        ReportActionComposeFocusManager.focus();
        toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
    };

    return (
        <ContextMenuItem
            icon={icons.Exit}
            text={translate('reportActionContextMenu.leaveThread')}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress, false)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD}
        />
    );
}

export default LeaveThread;
