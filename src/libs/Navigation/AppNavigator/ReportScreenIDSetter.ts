import {useEffect} from 'react';
import useLastAccessedReportID from '@hooks/useLastAccessedReportID';
import Log from '@libs/Log';
import type {ReportScreenWrapperProps} from './ReportScreenWrapper';

type ReportScreenIDSetterProps = ReportScreenWrapperProps;

// This wrapper is responsible for opening the last accessed report if there is no reportID specified in the route params
function ReportScreenIDSetter({route, navigation}: ReportScreenIDSetterProps) {
    const lastAccessedReportID = useLastAccessedReportID(!!route.params.openOnAdminRoom);
    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route.params.reportID) {
            const reportActionID = route?.params?.reportActionID;
            const regexValidReportActionID = new RegExp(/^\d*$/);
            if (reportActionID && !regexValidReportActionID.test(reportActionID)) {
                navigation.setParams({reportActionID: ''});
            }
            return;
        }

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (!lastAccessedReportID) {
            return;
        }

        Log.info(`[ReportScreen] no reportID found in params, setting it to lastAccessedReportID: ${lastAccessedReportID}`);
        navigation.setParams({reportID: lastAccessedReportID});
    }, [lastAccessedReportID, navigation, route]);

    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return null;
}

ReportScreenIDSetter.displayName = 'ReportScreenIDSetter';

export default ReportScreenIDSetter;
