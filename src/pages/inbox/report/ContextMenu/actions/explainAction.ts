import type {OnyxEntry} from 'react-native-onyx';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {hasReasoning} from '@libs/ReportActionsUtils';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, Report as ReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import KeyboardUtils from '@src/utils/keyboard';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type ExplainActionParams = BaseContextMenuActionParams & {
    childReport: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
    hideAndRun: (callback?: () => void) => void;
    conciergeIcon: IconAsset;
};

function shouldShowExplainAction({reportAction, isArchivedRoom}: {reportAction: OnyxEntry<ReportAction>; isArchivedRoom: boolean}): boolean {
    if (isArchivedRoom || !reportAction) {
        return false;
    }
    return hasReasoning(reportAction);
}

function createExplainAction({childReport, originalReport, reportAction, currentUserPersonalDetails, hideAndRun, translate, conciergeIcon}: ExplainActionParams): ContextMenuAction {
    return {
        id: 'explain',
        icon: conciergeIcon,
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

export default createExplainAction;
export {shouldShowExplainAction};
