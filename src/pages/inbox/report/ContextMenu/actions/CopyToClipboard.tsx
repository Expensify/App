import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function CopyToClipboard() {
    const {selection, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.COPY_TO_CLIPBOARD);
    if (actionIndex === -1) {
        return null;
    }

    const handlePress = () => {
        Clipboard.setString(selection);
        hideContextMenu(true, ReportActionComposeFocusManager.focus);
    };

    return (
        <ContextMenuItem
            icon={icons.Copy}
            text={translate('common.copyToClipboard')}
            successText={translate('reportActionContextMenu.copied')}
            successIcon={icons.Checkmark}
            isMini={isMini}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_TO_CLIPBOARD}
        />
    );
}

export default CopyToClipboard;
