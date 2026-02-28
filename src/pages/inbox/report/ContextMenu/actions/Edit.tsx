import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {getActionHtml} from './actionConfig';

function Edit({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, reportAction, moneyRequestAction, draftMessage, introSelected, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil'] as const);

    const closePopover = !isMini;

    const handlePress = () => {
        if (isMoneyRequestAction(reportAction) || isMoneyRequestAction(moneyRequestAction)) {
            const editExpense = () => {
                const childReportID = reportAction?.childReportID;
                openReport(childReportID, introSelected);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
            };
            if (closePopover) {
                hideContextMenu(false, editExpense);
                return;
            }
            editExpense();
            return;
        }
        const editAction = () => {
            if (!draftMessage) {
                saveReportActionDraft(reportID, reportAction, Parser.htmlToMarkdown(getActionHtml(reportAction)));
            } else {
                deleteReportActionDraft(reportID, reportAction);
            }
        };
        if (closePopover) {
            hideContextMenu(false, editAction);
            return;
        }
        editAction();
    };

    return (
        <ContextMenuItem
            icon={icons.Pencil}
            text={translate('reportActionContextMenu.editAction', {action: moneyRequestAction ?? reportAction})}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT}
        />
    );
}

export default Edit;
