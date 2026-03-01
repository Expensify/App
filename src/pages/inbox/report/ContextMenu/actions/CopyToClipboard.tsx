import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useCopyToClipboardAction(): ActionDescriptor | null {
    const {selection, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    return {
        id: 'copyToClipboard',
        icon: icons.Copy,
        text: translate('common.copyToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: icons.Checkmark,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(selection);
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_TO_CLIPBOARD,
    };
}

export default useCopyToClipboardAction;
