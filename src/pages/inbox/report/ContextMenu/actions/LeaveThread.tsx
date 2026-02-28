import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function LeaveThread() {
    const {reportAction, originalReport, currentUserAccountID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Exit'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.LEAVE_THREAD);
    if (actionIndex === -1) {
        return null;
    }

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
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD}
        />
    );
}

export default LeaveThread;
