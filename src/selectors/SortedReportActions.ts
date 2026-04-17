import type {OnyxEntry} from 'react-native-onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

const lastActionsSelector = (value: OnyxEntry<SortedReportActionsDerivedValue>) => value?.lastActions;

export default {lastActionsSelector};
