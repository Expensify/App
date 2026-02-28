import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';
import {useContextMenuVisibility} from '../ContextMenuLayout';
import {useContextMenuPayload} from '../ContextMenuPayloadProvider';
import {hideContextMenu} from '../ReportActionContextMenu';
import {ACTION_IDS} from './actionConfig';

function Unpin() {
    const {reportID, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Pin'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.UNPIN);
    if (actionIndex === -1) {
        return null;
    }

    const closePopover = !isMini;

    const handlePress = () => {
        togglePinnedState(reportID, true);
        if (closePopover) {
            hideContextMenu(false, ReportActionComposeFocusManager.focus);
        }
    };

    return (
        <ContextMenuItem
            icon={icons.Pin}
            text={translate('common.unPin')}
            isMini={isMini}
            onPress={handlePress}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.UNPIN}
        />
    );
}

export default Unpin;
