import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import LoadingScreen from '@components/LoadingScreen';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function ReportView({reportID}) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isReportLoading] = useOnyx(ONYXKEYS.IS_REPORT_LOADING);

    const shouldShowNotFound = useMemo(() => !report && !isReportLoading, [report, isReportLoading]);

    if (isReportLoading) {
        return <LoadingScreen />;
    }

    if (shouldShowNotFound) {
        return <FullPageNotFoundView />;
    }

    // Defensive check: Ensure report exists before rendering split preview logic
    if (!report) {
        return null;
    }

    return (
        <View>
            {/* Existing Split Preview implementation */}
        </View>
    );
}

export default ReportView;