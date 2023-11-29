import React from 'react';
import ReportScreen from '@pages/home/ReportScreen';
import ReportScreenIDSetter from './ReportScreenIDSetter';

type Props = {
    route: any;
    navigation: any;
};

function ReportScreenWrapper({route, navigation}: Props) {
    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return (
        <>
            {/* @ts-expect-error explanation */}
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
