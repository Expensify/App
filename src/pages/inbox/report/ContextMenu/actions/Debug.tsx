import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function Debug({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, reportAction, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Bug'] as const);
    const {translate} = useLocalize();

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
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DEBUG}
        />
    );
}

export default Debug;
