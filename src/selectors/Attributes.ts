import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

const reportsSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports;

const reportSelectorFromReportID = (reportID: string) => (attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports?.[reportID];

export {reportsSelector, reportSelectorFromReportID};
