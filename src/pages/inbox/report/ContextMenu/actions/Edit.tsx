import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {getActionHtml} from './actionConfig';
import type {ActionDescriptor} from './ActionDescriptor';

function useEditAction(): ActionDescriptor | null {
    const {reportID, reportAction, moneyRequestAction, draftMessage, introSelected, interceptAnonymousUser, hideAndRun} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil'] as const);

    return {
        id: 'edit',
        icon: icons.Pencil,
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

export default useEditAction;
