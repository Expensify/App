import React from 'react';
import {View} from 'react-native';
import styles from '../../style/StyleSheet';
import ReportView from './Report/ReportView';

const MainView = () => (
    <View style={[styles.flex4, styles.p1]}>
        <ReportView />
    </View>
);

export default MainView;
