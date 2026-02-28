import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

function CopyURL({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {selection, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    const handlePress = () => {
        Clipboard.setString(selection);
        hideContextMenu(true, ReportActionComposeFocusManager.focus);
    };

    return (
        <ContextMenuItem
            icon={icons.Copy}
            text={translate('reportActionContextMenu.copyURLToClipboard')}
            successText={translate('reportActionContextMenu.copied')}
            successIcon={icons.Checkmark}
            description={selection}
            isMini={isMini}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_URL}
        />
    );
}

export default CopyURL;
