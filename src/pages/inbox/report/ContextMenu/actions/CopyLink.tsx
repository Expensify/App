import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useCopyLinkAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {reportAction, originalReportID, interceptAnonymousUser} = useContextMenuPayload(payloadOverride);
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    return {
        id: 'copyLink',
        icon: icons.LinkCopy,
        text: translate('reportActionContextMenu.copyLink'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: icons.Checkmark,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                getEnvironmentURL().then((environmentURL) => {
                    const reportActionID = reportAction?.reportActionID;
                    Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
                });
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK,
    };
}

export default useCopyLinkAction;
