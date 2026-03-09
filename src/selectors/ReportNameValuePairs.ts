import type {OnyxEntry} from 'react-native-onyx';
import type {ReportNameValuePairs} from '@src/types/onyx';

/**
 * Selector that extracts only the private_isArchived value from a single ReportNameValuePairs entry
 */
const privateIsArchivedSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): string | undefined => reportNameValuePairs?.private_isArchived;

// eslint-disable-next-line import/prefer-default-export
export {privateIsArchivedSelector};
