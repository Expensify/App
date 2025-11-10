import type {OnyxEntry} from 'react-native-onyx';
import type {ReportMetadata} from '@src/types/onyx';

const isActionLoadingSelector = (reportMetadata: OnyxEntry<ReportMetadata> | undefined) => reportMetadata?.isActionLoading;

export default isActionLoadingSelector;
