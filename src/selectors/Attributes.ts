import type {OnyxEntry} from 'react-native-onyx';
import {ReportAttributesDerivedValue} from '@src/types/onyx';

const reportsSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports;

const reportSelectorFromReportID = (reportID: string) => (attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports?.[reportID];

export {reportsSelector, reportSelectorFromReportID};
