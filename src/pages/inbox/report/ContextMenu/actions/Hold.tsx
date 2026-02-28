import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function Hold() {
    const {moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.HOLD);
    if (actionIndex === -1) {
        return null;
    }

    const closePopover = !isMini;

    const handlePress = () => {
        if (isDelegateAccessRestricted) {
            hideContextMenu(false, showDelegateNoAccessModal);
            return;
        }
        if (closePopover) {
            hideContextMenu(false, () => changeMoneyRequestHoldStatus(moneyRequestAction));
            return;
        }
        changeMoneyRequestHoldStatus(moneyRequestAction);
    };

    return (
        <ContextMenuItem
            icon={icons.Stopwatch}
            text={translate('iou.hold')}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress, false)}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD}
        />
    );
}

export default Hold;
