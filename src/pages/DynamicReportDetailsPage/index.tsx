import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import getBase62ReportID from '@libs/getBase62ReportID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {
    isFinancialReportsForBusinesses as isFinancialReportsForBusinessesUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isSelfDM as isSelfDMUtil,
} from '@libs/ReportUtils';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import {getReportPrivateNote} from '@userActions/Report';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import ReportDetailsActions from './ReportDetailsActions';
import ReportDetailsAvatar from './ReportDetailsAvatar';
import ReportDetailsDescription from './ReportDetailsDescription';
import ReportDetailsNameSection from './ReportDetailsNameSection';
import ReportDetailsPromotedActions from './ReportDetailsPromotedActions';
import ReportDetailsTitleSection from './ReportDetailsTitleSection';

type DynamicReportDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>;

function DynamicReportDetailsPage({report, reportLoadingState}: DynamicReportDetailsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const navigateBackFromReportDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS.path);
    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const isMoneyRequest = isMoneyRequestUtil(report);
    const isInvoiceReport = isInvoiceReportUtil(report);
    const isFinancialReportsForBusinesses = isFinancialReportsForBusinessesUtil(report);
    const isSelfDM = isSelfDMUtil(report);
    const isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    const base62ReportID = getBase62ReportID(Number(report.reportID));

    const isPrivateNotesFetchTriggered = reportLoadingState?.isLoadingPrivateNotes !== undefined;

    useEffect(() => {
        // Do not fetch private notes if the feature is disabled, isLoadingPrivateNotes is already defined, the network is offline, or if the report is a self DM.
        if (!Permissions.canUsePrivateNotes() || isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    return (
        <ScreenWrapper testID="DynamicReportDetailsPage">
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackFromReportDetailsPath)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        <ReportDetailsAvatar reportID={report.reportID} />
                    </View>
                    {isExpenseReport ? <ReportDetailsTitleSection reportID={report.reportID} /> : <ReportDetailsNameSection reportID={report.reportID} />}

                    <ReportDetailsDescription reportID={report.reportID} />

                    {isFinancialReportsForBusinesses && (
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

                    <ReportDetailsPromotedActions reportID={report.reportID} />

                    <ReportDetailsActions reportID={report.reportID} />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportDetailsPage);
