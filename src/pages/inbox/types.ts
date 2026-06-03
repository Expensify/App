import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, SearchReportNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';

type ReportScreenNavigationProps =
    | PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackScreenProps<SearchReportNavigatorParamList, typeof SCREENS.DYNAMIC_SEARCH_REPORT>;

export default ReportScreenNavigationProps;
