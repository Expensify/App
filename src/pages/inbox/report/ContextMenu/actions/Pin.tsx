import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';

function Pin({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Pin'] as const);
    const {translate} = useLocalize();

    const closePopover = !isMini;

    const handlePress = () => {
        togglePinnedState(reportID, false);
        if (closePopover) {
            hideContextMenu(false, ReportActionComposeFocusManager.focus);
        }
    };

    return (
        <ContextMenuItem
            icon={icons.Pin}
            text={translate('common.pin')}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.PIN}
        />
    );
}

export default Pin;
