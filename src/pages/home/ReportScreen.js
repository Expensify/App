import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash.get';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const ReportScreen = (props) => {
    const activeReportID = lodashGet(props, ['route', 'params', 'reportID'], 0);
    if (!activeReportID) {
        return null;
    }

    return (
        <ScreenWrapper
            style={[
                styles.appContent,
                styles.flex1,
                styles.flexColumn,
            ]}
        >
            {() => (
                <>
                    <HeaderView
                        onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                    />
                    <View
                        key={activeReportID}
                        style={[styles.dFlex, styles.flex1]}
                    >
                        <ReportView
                            reportID={parseInt(activeReportID, 10)}
                            isActiveReport
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
};

ReportScreen.displayName = 'ReportScreen';
export default ReportScreen;
