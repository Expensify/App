import type {OnyxEntry} from 'react-native-onyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction} from '@libs/ReportUtils';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import {getActionHtml} from './actionConfig';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type EditActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    draftMessage: string;
    introSelected: OnyxEntry<IntroSelected>;
    hideAndRun: (callback?: () => void) => void;
    pencilIcon: IconAsset;
};

function shouldShowEditAction({
    reportAction,
    isArchivedRoom,
    isChronosReport,
    moneyRequestAction,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    moneyRequestAction: ReportAction | undefined;
}): boolean {
    return (canEditReportAction(reportAction) || canEditReportAction(moneyRequestAction)) && !isArchivedRoom && !isChronosReport;
}

function createEditAction({reportID, reportAction, moneyRequestAction, draftMessage, introSelected, hideAndRun, translate, pencilIcon}: EditActionParams): ContextMenuAction {
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
export {shouldShowEditAction};
