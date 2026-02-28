import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

function CopyLink({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportAction, originalReportID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    const handlePress = () => {
        getEnvironmentURL().then((environmentURL) => {
            const reportActionID = reportAction?.reportActionID;
            Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
        });
        hideContextMenu(true, ReportActionComposeFocusManager.focus);
    };

    return (
        <ContextMenuItem
            icon={icons.LinkCopy}
            text={translate('reportActionContextMenu.copyLink')}
            successText={translate('reportActionContextMenu.copied')}
            successIcon={icons.Checkmark}
            isMini={isMini}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK}
        />
    );
}

export default CopyLink;
