import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

function Unhold({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);

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
            text={translate('iou.unhold')}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress, false)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.UNHOLD}
        />
    );
}

export default Unhold;
