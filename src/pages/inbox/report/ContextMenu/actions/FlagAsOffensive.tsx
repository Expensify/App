import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import KeyboardUtils from '@src/utils/keyboard';
import type {ActionDescriptor} from './ActionDescriptor';

function useFlagAsOffensiveAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {reportID, reportAction, hideAndRun} = useContextMenuPayload(payloadOverride);
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);
    const {translate} = useLocalize();

    return {
        id: 'flagAsOffensive',
        icon: icons.Flag,
        text: translate('reportActionContextMenu.flagAsOffensive'),
        onPress: () => {
            if (!reportID) {
                return;
            }
            const activeRoute = Navigation.getActiveRoute();
            hideAndRun(() => {
                KeyboardUtils.dismiss().then(() => {
                    Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
                });
            });
        },
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE,
    };
}

export default useFlagAsOffensiveAction;
