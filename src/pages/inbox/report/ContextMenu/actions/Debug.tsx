import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ActionDescriptor} from './ActionDescriptor';

function useDebugAction(): ActionDescriptor | null {
    const {reportID, reportAction, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Bug'] as const);
    const {translate} = useLocalize();

    return {
        id: 'debug',
        icon: icons.Bug,
        text: translate('debug.debug'),
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                if (!reportID) {
                    return;
                }
                if (reportAction) {
                    Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, reportAction.reportActionID));
                } else {
                    Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(reportID));
                }
                hideContextMenu(false, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DEBUG,
    };
}

export default useDebugAction;
