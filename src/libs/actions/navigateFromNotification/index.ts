import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

const navigateFromNotification = (reportID: string) => {
    Navigation.navigateToReportWithPolicyCheck({reportID, referrer: CONST.REFERRER.NOTIFICATION});
};

export default navigateFromNotification;
