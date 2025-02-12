import Navigation from '@libs/Navigation/Navigation';

const navigateFromNotification = (reportID: string, policyIDToCheck?: string) => {
    Navigation.navigateToReportWithPolicyCheck({reportID, policyIDToCheck});
};

export default navigateFromNotification;
