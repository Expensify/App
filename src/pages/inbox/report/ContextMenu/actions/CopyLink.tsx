import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import CONST from '@src/CONST';
import {useContextMenuVisibility} from '../ContextMenuLayout';
import {useContextMenuPayload} from '../ContextMenuPayloadProvider';
import {hideContextMenu} from '../ReportActionContextMenu';
import {ACTION_IDS} from './actionConfig';

function CopyLink() {
    const {reportAction, originalReportID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy', 'Checkmark'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.COPY_LINK);
    if (actionIndex === -1) {
        return null;
    }

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
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK}
        />
    );
}

export default CopyLink;
