import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useMarkAsReadAction(): ActionDescriptor | null {
    const {reportID, interceptAnonymousUser, hideAndRun} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Mail', 'Checkmark'] as const);

    return {
        id: 'markAsRead',
        icon: icons.Mail,
        text: translate('reportActionContextMenu.markAsRead'),
        successIcon: icons.Checkmark,
        onPress: () =>
            interceptAnonymousUser(() => {
                readNewestAction(reportID, true, true);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ,
    };
}

export default useMarkAsReadAction;
