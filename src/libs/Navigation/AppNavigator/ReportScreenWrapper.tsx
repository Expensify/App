import React from 'react';
import ReportScreen from '@pages/home/ReportScreen';
import ReportScreenIDSetter from './ReportScreenIDSetter';
import {ReportScreenWrapperProps} from './types';

function ReportScreenWrapper({route, navigation}: ReportScreenWrapperProps) {
    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return (
        <>
            <ReportScreen route={route} />
            <ReportScreenIDSetter
                route={route}
                navigation={navigation}
            />
        </>
    );
}

ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default ReportScreenWrapper;
