import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import KeyboardUtils from '@src/utils/keyboard';

function FlagAsOffensive({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, reportAction, isMini} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);
    const {translate} = useLocalize();

    const closePopover = !isMini;

    const handlePress = () => {
        if (!reportID) {
            return;
        }
        const activeRoute = Navigation.getActiveRoute();
        if (closePopover) {
            hideContextMenu(false, () => {
                KeyboardUtils.dismiss().then(() => {
                    Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
                });
            });
            return;
        }
        Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
    };

    return (
        <ContextMenuItem
            icon={icons.Flag}
            text={translate('reportActionContextMenu.flagAsOffensive')}
            isMini={isMini}
            onPress={handlePress}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE}
        />
    );
}

export default FlagAsOffensive;
