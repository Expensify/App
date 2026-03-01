import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import type {ActionDescriptor} from './ActionDescriptor';

function useExplainAction(): ActionDescriptor | null {
    const {childReport, originalReport, reportAction, currentUserPersonalDetails, interceptAnonymousUser, hideAndRun} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Concierge'] as const);

    return {
        id: 'explain',
        icon: icons.Concierge,
        text: translate('reportActionContextMenu.explain'),
        onPress: () =>
            interceptAnonymousUser(() => {
                if (!originalReport?.reportID) {
                    return;
                }
                hideAndRun(() => {
                    KeyboardUtils.dismiss().then(() =>
                        explain(childReport, originalReport, reportAction, translate, currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails?.timezone),
                    );
                });
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN,
    };
}

export default useExplainAction;
