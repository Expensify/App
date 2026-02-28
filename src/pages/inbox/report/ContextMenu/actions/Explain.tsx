import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

function Explain({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {childReport, originalReport, reportAction, currentUserPersonalDetails, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Concierge'] as const);

    const closePopover = !isMini;

    const handlePress = () => {
        if (!originalReport?.reportID) {
            return;
        }
        const doExplain = () =>
            explain(childReport, originalReport, reportAction, translate, currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails?.timezone);
        if (closePopover) {
            hideContextMenu(false, () => {
                KeyboardUtils.dismiss().then(doExplain);
            });
            return;
        }
        doExplain();
    };

    return (
        <ContextMenuItem
            icon={icons.Concierge}
            text={translate('reportActionContextMenu.explain')}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress)}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN}
        />
    );
}

export default Explain;
