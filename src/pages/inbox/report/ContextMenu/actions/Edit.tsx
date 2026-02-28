import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {ACTION_IDS, getActionHtml} from './actionConfig';

function Edit() {
    const {reportID, reportAction, moneyRequestAction, draftMessage, introSelected, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil'] as const);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.EDIT);
    if (actionIndex === -1) {
        return null;
    }
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
            onPress={handlePress}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT}
        />
    );
}

export default Edit;
