import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const navigateFromNotification = (reportID: string) => {
    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, CONST.REFERRER.NOTIFICATION));
};

export default navigateFromNotification;
