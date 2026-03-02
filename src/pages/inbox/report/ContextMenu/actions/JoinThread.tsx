import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useJoinThreadAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun} = useContextMenuPayload(payloadOverride);
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bell'] as const);

    return {
        id: 'joinThread',
        icon: icons.Bell,
        text: translate('reportActionContextMenu.joinThread'),
        onPress: () =>
            interceptAnonymousUser(() => {
                const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                hideAndRun(() => {
                    ReportActionComposeFocusManager.focus();
                    toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
                });
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.JOIN_THREAD,
    };
}

export default useJoinThreadAction;
