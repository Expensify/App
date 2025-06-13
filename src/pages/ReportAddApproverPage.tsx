import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportAddApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.ADD_APPROVER>;

function ReportAddApproverPage({report}: ReportAddApproverPageProps) {
    return null;
}

ReportAddApproverPage.displayName = 'ReportAddApproverPage';

export default withReportOrNotFound()(ReportAddApproverPage);
