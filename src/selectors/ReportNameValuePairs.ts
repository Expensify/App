import type {OnyxEntry} from 'react-native-onyx';
import type {ReportNameValuePairs} from '@src/types/onyx';

/**
 * Selector that extracts and trims the agentZeroProcessingRequestIndicator value
 */
const agentZeroProcessingIndicatorSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): string => reportNameValuePairs?.agentZeroProcessingRequestIndicator?.trim() ?? '';

export default agentZeroProcessingIndicatorSelector;
