import {useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';

type UseReportNavigationFallbackProps = {
    source?: AvatarSource;
    file?: FileObject | FileObject[];
    reportID?: string;
};

// If the user refreshes during the send attachment flow, we need to navigate back to the report or home
function useNavigateToReportOnRefresh({source, file, reportID}: UseReportNavigationFallbackProps) {
    useEffect(() => {
        if (!!source || !!file) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            if (reportID) {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            } else {
                Navigation.goBack(ROUTES.INBOX);
            }
        });
    }, [source, reportID, file]);
}

export default useNavigateToReportOnRefresh;
