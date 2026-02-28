import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {ACTION_IDS} from './actionConfig';

function Debug() {
    const {reportID, reportAction, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Bug'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.DEBUG);
    if (actionIndex === -1) {
        return null;
    }

    const handlePress = () => {
        if (!reportID) {
            return;
        }
        if (reportAction) {
            Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, reportAction.reportActionID));
        } else {
            Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(reportID));
        }
        hideContextMenu(false, ReportActionComposeFocusManager.focus);
    };

    return (
        <ContextMenuItem
            icon={icons.Bug}
            text={translate('debug.debug')}
            isMini={isMini}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DEBUG}
        />
    );
}

export default Debug;
