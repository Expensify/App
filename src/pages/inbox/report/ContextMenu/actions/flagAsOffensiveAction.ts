import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import KeyboardUtils from '@src/utils/keyboard';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createFlagAsOffensiveAction(params: ContextMenuActionParams): ActionDescriptor {
    const {payload, icons} = params;
    const {reportID, reportAction, hideAndRun, translate} = payload;

    return {
        id: 'flagAsOffensive',
        icon: icons.Flag,
        text: translate('reportActionContextMenu.flagAsOffensive'),
        onPress: () => {
            if (!reportID) {
                return;
            }
            const activeRoute = Navigation.getActiveRoute();
            hideAndRun(() => {
                KeyboardUtils.dismiss().then(() => {
                    Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
                });
            });
        },
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE,
    };
}

export default createFlagAsOffensiveAction;
