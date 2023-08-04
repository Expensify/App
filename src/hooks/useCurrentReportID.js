import {useContext} from 'react';
import {CurrentReportIDContext} from '../components/withCurrentReportID';

export default function useCurrentReportID() {
    return useContext(CurrentReportIDContext);
}
