import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type DistanceRequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
    // eslint-disable-next-line react/no-unused-prop-types
    defaultSelectedTab: SelectedTabRequest;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DistanceRequestStartPage(props: DistanceRequestStartPageProps) {
    return null;
}

DistanceRequestStartPage.displayName = 'DistanceRequestStartPage';

export default DistanceRequestStartPage;
