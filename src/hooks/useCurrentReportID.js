import {useContext} from 'react';
import {CurrentReportIdContext} from '../components/withCurrentReportId';

export default function useCurrentReportID() {
    return useContext(CurrentReportIdContext);
}
