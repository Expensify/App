import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

function CopyOnyxData({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {report, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);
    const {translate} = useLocalize();

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
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA}
        />
    );
}

export default CopyOnyxData;
