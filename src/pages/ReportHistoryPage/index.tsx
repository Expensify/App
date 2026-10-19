import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {openReportStatusPage} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportHistoryNavigatorParamList} from '@libs/Navigation/types';
import {isMoneyRequestReport} from '@libs/ReportUtils';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import getReportHistorySteps from './getReportHistorySteps';
import ReportHistoryItem from './ReportHistoryItem';

type ReportHistoryPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportHistoryNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_HISTORY>;

function ReportHistoryPage({report}: ReportHistoryPageProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_HISTORY.path);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`);
    const [reportUpcomingSteps] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_UPCOMING_STEPS}${report.reportID}`);

    useEffect(() => {
        openReportStatusPage(report.reportID);
    }, [report.reportID]);

    const steps = getReportHistorySteps({
        translate,
        dateFnsLocale,
        currentUserEmail: currentUserPersonalDetails.login,
        reportOwnerAccountID: report.ownerAccountID,
        reportActions,
        upcomingSteps: reportUpcomingSteps?.steps ?? [],
        nextStep: report.nextStep,
    });

    return (
        <ScreenWrapper testID="ReportHistoryPage">
            <FullPageNotFoundView shouldShow={!isMoneyRequestReport(report)}>
                <HeaderWithBackButtonAndTitle
                    title={translate('reportHistoryPage.title')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <ScrollView contentContainerStyle={[styles.ph5, styles.pv3]}>
                    {steps.map((step, index) => (
                        <View key={step.key}>
                            {index > 0 && <View style={styles.reportHistoryConnector} />}
                            <ReportHistoryItem step={step} />
                        </View>
                    ))}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportHistoryPage);
