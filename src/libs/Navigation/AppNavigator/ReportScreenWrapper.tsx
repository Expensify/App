import React from 'react';
import ReportScreen from '../../../pages/home/ReportScreen';
import ReportScreenIDSetter from './ReportScreenIDSetter';
import {ReportScreenWrapperProps} from './types';

function ReportScreenWrapper(props: ReportScreenWrapperProps) {
    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return (
        <>
            {/* TODO: Remove when ReportScreen is migrated */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <ReportScreen route={props.route} />
            <ReportScreenIDSetter
                route={props.route}
                navigation={props.navigation}
            />
        </>
    );
}

ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default ReportScreenWrapper;
