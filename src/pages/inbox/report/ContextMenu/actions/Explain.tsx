import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import {ACTION_IDS} from './actionConfig';

function Explain() {
    const {childReport, originalReport, reportAction, currentUserPersonalDetails, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Concierge'] as const);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.EXPLAIN);
    if (actionIndex === -1) {
        return null;
    }
    const closePopover = !isMini;

    return (
        <ContextMenuItem
            icon={icons.Concierge}
            text={translate('reportActionContextMenu.explain')}
            isMini={isMini}
            onPress={() => {
                if (!originalReport?.reportID) {
                    return;
                }
                const doExplain = () => explain(childReport, originalReport, reportAction, translate, currentUserPersonalDetails?.accountID ?? 0, currentUserPersonalDetails?.timezone);
                if (closePopover) {
                    hideContextMenu(false, () => {
                        KeyboardUtils.dismiss().then(doExplain);
                    });
                    return;
                }
                doExplain();
            }}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN}
        />
    );
}

export default Explain;
