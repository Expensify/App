import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

function CopyEmail({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {selection, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    const handlePress = () => {
        Clipboard.setString(EmailUtils.trimMailTo(selection));
        hideContextMenu(true, ReportActionComposeFocusManager.focus);
    };

    return (
        <ContextMenuItem
            icon={icons.Copy}
            text={translate('reportActionContextMenu.copyEmailToClipboard')}
            successText={translate('reportActionContextMenu.copied')}
            successIcon={icons.Checkmark}
            description={EmailUtils.prefixMailSeparatorsWithBreakOpportunities(EmailUtils.trimMailTo(selection ?? ''))}
            isMini={isMini}
            isAnonymousAction
            onPress={() => interceptAnonymousUser(handlePress, true)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_EMAIL}
        />
    );
}

export default CopyEmail;
