import Navigation from '@libs/Navigation/Navigation';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type DebugActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportAction: ReportAction;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    bugIcon: IconAsset;
};

function createDebugAction({reportID, reportAction, interceptAnonymousUser, translate, bugIcon}: DebugActionParams): ContextMenuAction {
    return {
        id: 'debug',
        icon: bugIcon,
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

export default createDebugAction;
