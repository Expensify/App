import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import CONST from '@src/CONST';
import {useContextMenuVisibility} from '../ContextMenuLayout';
import {useContextMenuPayload} from '../ContextMenuPayloadProvider';
import {hideContextMenu} from '../ReportActionContextMenu';
import {ACTION_IDS} from './actionConfig';

function CopyEmail() {
    const {selection, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.COPY_EMAIL);
    if (actionIndex === -1) {
        return null;
    }

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
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_EMAIL}
        />
    );
}

export default CopyEmail;
