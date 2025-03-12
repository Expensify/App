import React from 'react';
import {Text, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ReportPreview from '@components/ReportActionItem/ReportPreview';
import useLocalize from '@hooks/useLocalize';
import ONYXKEYS from '@src/ONYXKEYS';

function ExpenseSubmitted() {
    const {translate} = useLocalize();
    const [expenseReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}12345`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${expenseReport?.policyID}`);
    return (
        <View>
            <Text>{translate('notifications.expenseSubmitted', {submitter: 'James Dean'})}</Text>
            <ReportPreview
                iouReportID={expenseReport.reportID}
                chatReportID="67890"
                action={{}}
                policy={policy}
            />
        </View>
    );
}

ExpenseSubmitted.displayName = 'ReportPreview';

export default ExpenseSubmitted;
