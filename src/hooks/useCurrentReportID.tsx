import {useContext} from 'react';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import {CurrentReportIDContext} from '@components/withCurrentReportID';

export default function useCurrentReportID(): CurrentReportIDContextValue | null {
    return useContext(CurrentReportIDContext);
}
