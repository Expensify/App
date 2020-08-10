import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../style/StyleSheet';
import WithStore from '../../components/WithStore';
import STOREKEYS from '../../store/STOREKEYS';
import {fetchAll} from '../../store/actions/ReportActions';
import SidebarLink from './SidebarLink';

class SidebarView extends React.Component {
    render() {
        const reports = this.state && this.state.reports;
        return (
            <View style={[styles.flex1, styles.p1]}>
                {_.map(reports, report => (
                    <SidebarLink key={report.reportID} reportID={report.reportID} reportName={report.reportName} />
                ))}
            </View>
        );
    }
}

export default WithStore({
    reports: {
        key: STOREKEYS.REPORTS,
        loader: fetchAll,
        prefillWithKey: STOREKEYS.REPORTS,
    },
})(SidebarView);
