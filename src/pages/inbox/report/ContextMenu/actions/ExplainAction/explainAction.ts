import type {OnyxEntry} from 'react-native-onyx';
import {hasReasoning} from '@libs/ReportActionsUtils';
import type {ReportAction} from '@src/types/onyx';

function shouldShowExplainAction({reportAction, isArchivedRoom}: {reportAction: OnyxEntry<ReportAction>; isArchivedRoom: boolean}): boolean {
    if (isArchivedRoom || !reportAction) {
        return false;
    }
    return hasReasoning(reportAction);
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowExplainAction};
