import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import CONST from '@src/CONST';
import {useContextMenuVisibility} from '../ContextMenuLayout';
import {useContextMenuPayload} from '../ContextMenuPayloadProvider';
import {hideContextMenu} from '../ReportActionContextMenu';
import {ACTION_IDS} from './actionConfig';

function CopyOnyxData() {
    const {report, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.COPY_ONYX_DATA);
    if (actionIndex === -1) {
        return null;
    }

    const handlePress = () => {
        Clipboard.setString(JSON.stringify(report, null, 4));
        hideContextMenu(true, ReportActionComposeFocusManager.focus);
    };

    return (
        <ContextMenuItem
            icon={icons.Copy}
            text={translate('reportActionContextMenu.copyOnyxData')}
            successText={translate('reportActionContextMenu.copied')}
            successIcon={icons.Checkmark}
            isMini={isMini}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA}
        />
    );
}

export default CopyOnyxData;
