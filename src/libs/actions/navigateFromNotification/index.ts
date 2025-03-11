import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';

const navigateFromNotification = (reportID: string, policyIDToCheck?: string) => {
    Navigation.navigateToReportWithPolicyCheck({reportID, referrer: CONST.REFERRER.NOTIFICATION, policyIDToCheck});
};

export default navigateFromNotification;
