import {useContext} from 'react';
import {CurrentReportIDContext, CurrentReportIDContextValue} from '@components/withCurrentReportID';

export default function useCurrentReportID(): CurrentReportIDContextValue | null {
    return useContext(CurrentReportIDContext);
}
