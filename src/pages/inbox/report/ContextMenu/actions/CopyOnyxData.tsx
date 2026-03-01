import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useCopyOnyxDataAction(): ActionDescriptor | null {
    const {report, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    return {
        id: 'copyOnyxData',
        icon: icons.Copy,
        text: translate('reportActionContextMenu.copyOnyxData'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: icons.Checkmark,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(JSON.stringify(report, null, 4));
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA,
    };
}

export default useCopyOnyxDataAction;
