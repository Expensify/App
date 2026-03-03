import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createExplainAction(params: ContextMenuActionParams): ActionDescriptor {
    const {payload, icons} = params;
    const {childReport, originalReport, reportAction, currentUserPersonalDetails, interceptAnonymousUser, hideAndRun, translate} = payload;

    return {
        id: 'explain',
        icon: icons.Concierge,
        text: translate('reportActionContextMenu.explain'),
        onPress: () =>
            interceptAnonymousUser(() => {
                if (!originalReport?.reportID) {
                    return;
                }
                hideAndRun(() => {
                    KeyboardUtils.dismiss().then(() =>
                        explain(childReport, originalReport, reportAction, translate, currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails?.timezone),
                    );
                });
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN,
    };
}

export default createExplainAction;
