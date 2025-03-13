import React from 'react';
import {Text, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ReportPreview from '@components/ReportActionItem/ReportPreview';
import useLocalize from '@hooks/useLocalize';
import ReportActionItemSingle from '@pages/home/report/ReportActionItemSingle';
import ONYXKEYS from '@src/ONYXKEYS';

function ExpenseSubmitted() {
    const {translate} = useLocalize();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}5118058170398105`);
    const [reportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}5118058170398105`, {selector: (data) => data['5758101172806069701']});
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}319078533623085`);
    const [submitterPersonalDetails = {}] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (data) => data[iouReport.ownerAccountID]});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}B432022CA277D1BB`);
    return (
        <View>
            <Text>{translate('notifications.expenseSubmitted', {submitter: submitterPersonalDetails.displayName})}</Text>
            <ReportActionItemSingle
                action={reportAction}
                report={chatReport}
                iouReport={iouReport}
            >
                <ReportPreview
                    iouReportID={iouReport.reportID}
                    chatReportID={chatReport.reportID}
                    action={reportAction}
                    policy={policy}
                />
            </ReportActionItemSingle>
        </View>
    );
}

ExpenseSubmitted.displayName = 'ReportPreview';

export default ExpenseSubmitted;
