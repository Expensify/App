import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {AuthScreensParamList} from '@navigation/types';
import ReportScreen from '@pages/home/ReportScreen';
import type SCREENS from '@src/SCREENS';
import ReportScreenIDSetter from './ReportScreenIDSetter';

type ReportScreenWrapperProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT>;

function ReportScreenWrapper({route, navigation}: ReportScreenWrapperProps) {
    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return (
        <>
            <ReportScreen
                route={route}
                navigation={navigation}
            />
            <ReportScreenIDSetter
                route={route}
                navigation={navigation}
            />
        </>
    );
}

ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default ReportScreenWrapper;
export type {ReportScreenWrapperProps};
