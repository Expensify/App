import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useHoldAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal, interceptAnonymousUser, hideAndRun} = useContextMenuPayload(payloadOverride);
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);

    return {
        id: 'hold',
        icon: icons.Stopwatch,
        text: translate('iou.hold'),
        onPress: () =>
            interceptAnonymousUser(() => {
                if (isDelegateAccessRestricted) {
                    hideContextMenu(false, showDelegateNoAccessModal);
                    return;
                }
                hideAndRun(() => changeMoneyRequestHoldStatus(moneyRequestAction));
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD,
    };
}

export default useHoldAction;
