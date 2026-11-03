/** Bill intake uses a submission action to record the bill's creator, sender, and receiver. */
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isBillSubmittedAction(action: OnyxEntry<ReportAction>, report: OnyxEntry<Report>): boolean {
    return (
        report?.type === CONST.REPORT.UNSUPPORTED_TYPE.BILL &&
        (action?.actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED || action?.actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)
    );
}

export default isBillSubmittedAction;
