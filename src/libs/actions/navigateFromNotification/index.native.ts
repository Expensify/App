import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const navigateFromNotification = (reportID: string) => {
    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
};

export default navigateFromNotification;
