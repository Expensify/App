import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import type IOURequestStepDistanceGPSProps from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IOURequestStepDistanceGPS(props: IOURequestStepDistanceGPSProps) {
    return null;
}

IOURequestStepDistanceGPS.displayName = 'IOURequestStepDistanceGPS';

const IOURequestStepDistanceGPSWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceGPS);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceGPSWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceGPSWithWritableReportOrNotFound);

export default IOURequestStepDistanceGPSWithFullTransactionOrNotFound;
