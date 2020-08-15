import React from 'react';
import {View} from 'react-native';
import ReportHistoryView from './ReportHistoryView';
import ReportHistoryCompose from './ReportHistoryCompose';
import {addHistoryItem} from '../../../lib/actions/ActionsReport';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../style/StyleSheet';

const ReportView = ({reportID}) => (
    <>
        <View style={[styles.chatContent]}>
            <ReportHistoryView reportID={reportID} />
            <ReportHistoryCompose
                reportID={reportID}
                onSubmit={addHistoryItem}
            />
            <KeyboardSpacer />
        </View>
    </>
);
ReportView.displayName = 'ReportView';

export default ReportView;
