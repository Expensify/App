import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';
import useThemeStyles from '@hooks/useThemeStyles';

import {openReportStatusPage} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportHistoryNavigatorParamList} from '@libs/Navigation/types';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {isGroupPolicyExpenseReport, isOpenExpenseReport} from '@libs/ReportUtils';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {isLoadingReportStatusSelector} from '@selectors/ReportMetaData';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import getReportHistorySteps from './getReportHistorySteps';
import ReportHistoryItem from './ReportHistoryItem';
import ReportHistoryItemSkeleton from './ReportHistoryItemSkeleton';

type ReportHistoryPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportHistoryNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_HISTORY>;

function ReportHistoryPage({report}: ReportHistoryPageProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_HISTORY.path);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`);
    const [reportUpcomingSteps] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_UPCOMING_STEPS}${report.reportID}`);
    const [isLoadingReportStatus] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report.reportID}`, {selector: isLoadingReportStatusSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report.policyID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`);
    const nextStep = useOptimisticNextStep(report.reportID);
    const {isOffline} = useNetwork({onReconnect: () => openReportStatusPage(report.reportID)});

    useEffect(() => {
        openReportStatusPage(report.reportID);
    }, [report.reportID]);

    const steps = getReportHistorySteps({
        translate,
        dateFnsLocale,
        currentUserEmail: currentUserPersonalDetails.login,
        currentUserAccountID: currentUserPersonalDetails.accountID,
        reportID: report.reportID,
        reportOwnerAccountID: report.ownerAccountID,
        reportActions,
        upcomingSteps: reportUpcomingSteps?.steps ?? [],
        nextStep,
        isOpenReport: isOpenExpenseReport(report),
        isDEWPolicy: hasDynamicExternalWorkflow(policy),
        reportMetadata,
    });

    const shouldShowSkeleton = !!isLoadingReportStatus && !reportUpcomingSteps && !isOffline;

    return (
        <ScreenWrapper testID="ReportHistoryPage">
            <FullPageNotFoundView shouldShow={!isGroupPolicyExpenseReport(report, policy?.type)}>
                <HeaderWithBackButtonAndTitle
                    title={translate('reportHistoryPage.title')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <ScrollView contentContainerStyle={[styles.ph5, styles.pv3]}>
                    {shouldShowSkeleton
                        ? Array.from({length: steps.length + 1}, (_, index) => (
                              <View key={index}>
                                  {index > 0 && <View style={styles.reportHistoryConnector} />}
                                  <ReportHistoryItemSkeleton />
                              </View>
                          ))
                        : steps.map((step, index) => (
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
