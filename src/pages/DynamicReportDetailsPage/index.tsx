import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useThemeStyles from '@hooks/useThemeStyles';

import getBase62ReportID from '@libs/getBase62ReportID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {isFinancialReportsForBusinesses, isInvoiceReport, isMoneyRequest, isMoneyRequestReport, isSelfDM} from '@libs/ReportUtils';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import {getReportPrivateNote} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import ReportDetailsActions from './ReportDetailsActions';
import ReportDetailsAvatar from './ReportDetailsAvatar';
import ReportDetailsDescription from './ReportDetailsDescription';
import ReportDetailsNameSection from './ReportDetailsNameSection';
import ReportDetailsPromotedActions from './ReportDetailsPromotedActions';
import ReportDetailsTitleSection from './ReportDetailsTitleSection';
import {CASES} from './types';

type DynamicReportDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>;

function DynamicReportDetailsPage({policy, report, route, reportMetadata, reportLoadingState}: DynamicReportDetailsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const navigateBackFromReportDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS.path);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const parentReportAction = useParentReportAction(report);

    const isSelfDMReport = isSelfDM(report);
    const isPrivateNotesFetchTriggered = reportLoadingState?.isLoadingPrivateNotes !== undefined;

    useEffect(() => {
        // Do not fetch private notes if the feature is disabled, isLoadingPrivateNotes is already defined, the network is offline, or if the report is a self DM.
        if (!Permissions.canUsePrivateNotes() || isPrivateNotesFetchTriggered || isOffline || isSelfDMReport) {
            return;
        }

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDMReport]);

    const caseID = getReportDetailsCaseID(report, parentReport, parentReportAction);
    const isExpenseReport = isMoneyRequestReport(report) || isInvoiceReport(report) || isMoneyRequest(report);
    const moneyRequestReportID = caseID === CASES.MONEY_REQUEST ? parentReport?.reportID : report.reportID;
    const base62ReportID = getBase62ReportID(Number(report.reportID));

    return (
        <ScreenWrapper testID="DynamicReportDetailsPage">
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackFromReportDetailsPath)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        <ReportDetailsAvatar
                            report={report}
                            policy={policy}
                            moneyRequestReportID={moneyRequestReportID}
                        />
                    </View>
                    {isExpenseReport ? (
                        <ReportDetailsTitleSection
                            report={report}
                            policy={policy}
                            parentReport={parentReport}
                            parentReportAction={parentReportAction}
                            caseID={caseID}
                        />
                    ) : (
                        <ReportDetailsNameSection
                            report={report}
                            policy={policy}
                            parentReport={parentReport}
                            parentReportAction={parentReportAction}
                            caseID={caseID}
                        />
                    )}

                    <ReportDetailsDescription
                        report={report}
                        policy={policy}
                        parentReport={parentReport}
                    />

                    {isFinancialReportsForBusinesses(report) && (
                        <>
                            <MenuItemWithTopDescription
                                title={base62ReportID}
                                description={translate('common.reportID')}
                                copyValue={base62ReportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                            <MenuItemWithTopDescription
                                title={report.reportID}
                                description={translate('common.longReportID')}
                                copyValue={report.reportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                        </>
                    )}

                    <ReportDetailsPromotedActions
                        report={report}
                        policy={policy}
                        parentReport={parentReport}
                        parentReportAction={parentReportAction}
                    />

                    <ReportDetailsActions
                        report={report}
                        policy={policy}
                        parentReport={parentReport}
                        parentReportAction={parentReportAction}
                        reportMetadata={reportMetadata}
                        caseID={caseID}
                        reportIDFromRoute={route.params.reportID}
                    />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportDetailsPage);
