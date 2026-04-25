import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import Navigation from './Navigation/Navigation';
import {generateReportID} from './ReportUtils';

function navigateToCreateReportUpgradePath() {
    const freshReportID = generateReportID();
    const freshTransactionID = generateReportID();

    Navigation.navigate(
        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
            action: CONST.IOU.ACTION.CREATE,
            iouType: CONST.IOU.TYPE.CREATE,
            transactionID: freshTransactionID,
            reportID: freshReportID,
            upgradePath: CONST.UPGRADE_PATHS.REPORTS,
        }),
    );
}

export default navigateToCreateReportUpgradePath;
