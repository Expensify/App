import {useNavigationState} from '@react-navigation/native';
import getTopmostRouteName from '@libs/Navigation/getTopmostRouteName';
import SCREENS from '@src/SCREENS';

// This hook checks if the currently open route is ReportScreen in RHP.
export default function useIsReportOpenInRHP() {
    const activeRoute = useNavigationState(getTopmostRouteName);
    return activeRoute === SCREENS.SEARCH.REPORT_RHP;
}
