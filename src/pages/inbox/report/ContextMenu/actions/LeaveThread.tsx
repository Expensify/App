import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useLeaveThreadAction(): ActionDescriptor | null {
    const {reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Exit'] as const);

    return {
        id: 'leaveThread',
        icon: icons.Exit,
        text: translate('reportActionContextMenu.leaveThread'),
        onPress: () =>
            interceptAnonymousUser(() => {
                const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                hideAndRun(() => {
                    ReportActionComposeFocusManager.focus();
                    toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
                });
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD,
    };
}

export default useLeaveThreadAction;
