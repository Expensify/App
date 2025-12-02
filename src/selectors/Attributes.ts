import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

const reportsSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports;

export default reportsSelector;
