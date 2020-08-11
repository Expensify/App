import React from 'react';
import {Text, View, Image} from 'react-native';
import _ from 'underscore';
import styles from '../../style/StyleSheet';
import WithStore from '../../components/WithStore';
import STOREKEYS from '../../store/STOREKEYS';
import {fetchAll} from '../../store/actions/ReportActions';
import SidebarLink from './SidebarLink';
import logo from '../../images/expensify-logo_reversed.png';

class SidebarView extends React.Component {
    render() {
        const reports = this.state && this.state.reports;
        return (
            <View style={[styles.flex1, styles.sidebar]}>
                <View style={[styles.sidebarHeader]}>
                    <Image
                        style={[styles.sidebarHeaderLogo]}
                        source={logo}
                    />
                </View>
                <View style={[styles.sidebarListContainer]}>
                    <View style={[styles.sidebarListItem]}>
                        <Text style={[styles.sidebarListHeader]}>
                            Chats
                        </Text>
                    </View>
                    {_.map(reports, report => (
                        <SidebarLink key={report.reportID} reportID={report.reportID} reportName={report.reportName} />
                    ))}
                </View>
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
