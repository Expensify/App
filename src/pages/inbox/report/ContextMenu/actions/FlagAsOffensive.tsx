import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import KeyboardUtils from '@src/utils/keyboard';
import {ACTION_IDS} from './actionConfig';

function FlagAsOffensive() {
    const {reportID, reportAction, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.FLAG_AS_OFFENSIVE);
    if (actionIndex === -1) {
        return null;
    }

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
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE}
        />
    );
}

export default FlagAsOffensive;
