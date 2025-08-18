/* eslint-disable @typescript-eslint/no-unused-vars */
import type {OnyxEntry} from 'react-native-onyx';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceManualProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceManual({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceManualProps) {
    return null;
}

IOURequestStepDistanceManual.displayName = 'IOURequestStepDistanceManual';

const IOURequestStepDistanceManualWithOnyx = IOURequestStepDistanceManual;

const IOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceManualWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceManualWithWritableReportOrNotFound);

export default IOURequestStepDistanceManualWithFullTransactionOrNotFound;
