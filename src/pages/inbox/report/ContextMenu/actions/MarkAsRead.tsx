import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

function MarkAsRead({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Mail', 'Checkmark'] as const);

    const closePopover = !isMini;

    const handlePress = () => {
        readNewestAction(reportID, true, true);
        if (closePopover) {
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        }
    };

    return (
        <ContextMenuItem
            icon={icons.Mail}
            text={translate('reportActionContextMenu.markAsRead')}
            successIcon={icons.Checkmark}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ}
        />
    );
}

export default MarkAsRead;
