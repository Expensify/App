import _ from 'underscore';
import * as IOU from './IOU';
import * as ReportUtils from '../ReportUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

const navigateToNextPage = (iou, reportID, report, currentUserPersonalDetails) => {
    const moneyRequestID = `${iou.iouType}${reportID.current}`;
    const shouldReset = iou.id !== moneyRequestID;
    // If the money request ID in Onyx does not match the ID from params, we want to start a new request
    // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
    if (shouldReset) {
        IOU.resetMoneyRequestInfo(moneyRequestID, iou.iouType);
    }

    // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
    if (report.reportID) {
        // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
        if (_.isEmpty(iou.participants) || shouldReset) {
            const currentUserAccountID = currentUserPersonalDetails.accountID;
            const participants = ReportUtils.isPolicyExpenseChat(report)
                ? [{reportID: report.reportID, isPolicyExpenseChat: true, selected: true}]
                : _.chain(report.participantAccountIDs)
                      .filter((accountID) => currentUserAccountID !== accountID)
                      .map((accountID) => ({accountID, selected: true}))
                      .value();
            IOU.setMoneyRequestParticipants(participants);
        }
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iou.iouType, reportID.current));
        return;
    }
    Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iou.iouType));
};

export default navigateToNextPage;
