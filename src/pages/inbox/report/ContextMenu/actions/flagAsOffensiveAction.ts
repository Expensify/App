import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {canFlagReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import KeyboardUtils from '@src/utils/keyboard';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type FlagAsOffensiveActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportAction: ReportAction;
    hideAndRun: (callback?: () => void) => void;
    flagIcon: IconAsset;
};

function shouldShowFlagAsOffensiveAction({
    reportAction,
    isArchivedRoom,
    isChronosReport,
    reportID,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    reportID: string | undefined;
}): boolean {
    return canFlagReportAction(reportAction, reportID) && !isArchivedRoom && !isChronosReport && reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE;
}

function createFlagAsOffensiveAction({reportID, reportAction, hideAndRun, translate, flagIcon}: FlagAsOffensiveActionParams): ContextMenuAction {
    return {
        id: 'flagAsOffensive',
        icon: flagIcon,
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

export default createFlagAsOffensiveAction;
export {shouldShowFlagAsOffensiveAction};
