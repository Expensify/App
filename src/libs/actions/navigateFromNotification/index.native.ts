import Navigation from '@navigation/Navigation';

const navigateFromNotification = (reportID: string, policyIDToCheck?: string) => {
    Navigation.navigateToReportWithPolicyCheck({reportID, policyIDToCheck});
};

export default navigateFromNotification;
