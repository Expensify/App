/* eslint-disable @typescript-eslint/no-unused-vars */
import type {OnyxEntry} from 'react-native-onyx';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceMapProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceMap({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceMapProps) {
    return null;
}

IOURequestStepDistanceMap.displayName = 'IOURequestStepDistanceMap';

const IOURequestStepDistanceMapWithOnyx = IOURequestStepDistanceMap;

const IOURequestStepDistanceMapWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceMapWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceMapWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceMapWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceMapWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceMapWithWritableReportOrNotFound);

export default IOURequestStepDistanceMapWithFullTransactionOrNotFound;
