import Navigation from '@libs/Navigation/Navigation';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createDebugAction(params: ContextMenuActionParams): ActionDescriptor {
    const {payload, icons} = params;
    const {reportID, reportAction, interceptAnonymousUser, translate} = payload;

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

export default createDebugAction;
