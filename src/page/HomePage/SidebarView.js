import React from 'react';
import {View, Text} from 'react-native';
import {NavLink} from '../../lib/Router';
import _ from 'underscore';
import styles from '../../style/StyleSheet';
import WithStoreSubscribeToState from '../../components/WithStoreSubscribeToState';
import STOREKEYS from '../../store/STOREKEYS';
import {fetchAll} from '../../store/actions/ReportActions';

class SidebarView extends React.Component {
    render() {
        return (
            <View style={[styles.flexGrow1, styles.p1]}>
                {this.state && this.state.reports && this.state.reports.length > 0 && _.map(this.state.reports, (report) => (
                    <View key={report.reportID}>
                        <NavLink to={`/${report.reportID}`}>{report.reportName}</NavLink>
                    </View>
                ))}
            </View>
        );
    }
}

export default WithStoreSubscribeToState({
    reports: {key: STOREKEYS.REPORTS, loader: fetchAll},
})(SidebarView);
