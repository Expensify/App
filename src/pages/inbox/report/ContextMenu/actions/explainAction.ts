import type {OnyxEntry} from 'react-native-onyx';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, Report as ReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import KeyboardUtils from '@src/utils/keyboard';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type ExplainActionParams = BaseContextMenuActionParams & {
    childReport: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    hideAndRun: (callback?: () => void) => void;
    conciergeIcon: IconAsset;
};

function createExplainAction({childReport, originalReport, reportAction, currentUserPersonalDetails, interceptAnonymousUser, hideAndRun, translate, conciergeIcon}: ExplainActionParams): ContextMenuAction {
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
export type {ExplainActionParams};
