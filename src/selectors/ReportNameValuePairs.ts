import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReportNameValuePairs} from '@src/types/onyx';

/**
 * Selector for invoice report name value pairs that filters by chat type
 * and returns only the private_isArchived field
 */
const invoiceReportNameValuePairsSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): Pick<ReportNameValuePairs, 'private_isArchived'> | undefined => {
    if (reportNameValuePairs && 'type' in reportNameValuePairs && reportNameValuePairs?.type !== CONST.REPORT.TYPE.CHAT) {
        return;
    }
    return (
        reportNameValuePairs &&
        ({
            private_isArchived: reportNameValuePairs.private_isArchived,
        } as Pick<ReportNameValuePairs, 'private_isArchived'>)
    );
};

// eslint-disable-next-line import/prefer-default-export
export {invoiceReportNameValuePairsSelector};
