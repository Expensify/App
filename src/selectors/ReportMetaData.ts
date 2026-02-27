import type {OnyxEntry} from 'react-native-onyx';
import type {ReportMetadata} from '@src/types/onyx';

const isActionLoadingSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isActionLoading ?? false;

export default isActionLoadingSelector;
