import {installRescueStuckReportTextSelection} from '@libs/rescueStuckReportTextSelection';

import {useEffect} from 'react';

import type UseRescueStuckReportTextSelection from './types';

const useRescueStuckReportTextSelection: UseRescueStuckReportTextSelection = () => {
    useEffect(() => installRescueStuckReportTextSelection(), []);
};

export default useRescueStuckReportTextSelection;
