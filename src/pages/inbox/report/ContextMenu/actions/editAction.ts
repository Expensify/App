import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import {getActionHtml} from './actionConfig';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type EditActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    draftMessage: string;
    introSelected: OnyxEntry<IntroSelected>;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    hideAndRun: (callback?: () => void) => void;
    pencilIcon: IconAsset;
};

function createEditAction({reportID, reportAction, moneyRequestAction, draftMessage, introSelected, interceptAnonymousUser, hideAndRun, translate, pencilIcon}: EditActionParams): ContextMenuAction {
    return {
        id: 'edit',
        icon: pencilIcon,
        text: translate('reportActionContextMenu.editAction', {action: moneyRequestAction ?? reportAction}),
        onPress: () =>
            interceptAnonymousUser(() => {
                if (isMoneyRequestAction(reportAction) || isMoneyRequestAction(moneyRequestAction)) {
                    hideAndRun(() => {
                        const childReportID = reportAction?.childReportID;
                        openReport(childReportID, introSelected);
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
                    });
                    return;
                }
                hideAndRun(() => {
                    if (!draftMessage) {
                        saveReportActionDraft(reportID, reportAction, Parser.htmlToMarkdown(getActionHtml(reportAction)));
                    } else {
                        deleteReportActionDraft(reportID, reportAction);
                    }
                });
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT,
    };
}

export default createEditAction;
export type {EditActionParams};
