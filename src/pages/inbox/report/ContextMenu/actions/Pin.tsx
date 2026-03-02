import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function usePinAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {reportID, interceptAnonymousUser, hideAndRun} = useContextMenuPayload(payloadOverride);
    const icons = useMemoizedLazyExpensifyIcons(['Pin'] as const);
    const {translate} = useLocalize();

    return {
        id: 'pin',
        icon: icons.Pin,
        text: translate('common.pin'),
        onPress: () =>
            interceptAnonymousUser(() => {
                togglePinnedState(reportID, false);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.PIN,
    };
}

export default usePinAction;
