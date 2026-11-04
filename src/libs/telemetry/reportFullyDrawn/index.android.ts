import {NativeModules} from 'react-native';

import type ReportFullyDrawn from './types';

const reportFullyDrawn: ReportFullyDrawn = () => {
    NativeModules.AppStateTracker.reportFullyDrawn?.();
};

export default reportFullyDrawn;
