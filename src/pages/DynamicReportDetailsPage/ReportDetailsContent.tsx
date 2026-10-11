import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getBase62ReportID from '@libs/getBase62ReportID';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {
    isFinancialReportsForBusinesses as isFinancialReportsForBusinessesUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isSelfDM as isSelfDMUtil,
} from '@libs/ReportUtils';

import {getReportPrivateNote} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import ReportDetailsActions from './ReportDetailsActions';
import ReportDetailsAvatar from './ReportDetailsAvatar';
import ReportDetailsDescription from './ReportDetailsDescription';
import ReportDetailsNameSection from './ReportDetailsNameSection';
import ReportDetailsPromotedActions from './ReportDetailsPromotedActions';
import ReportDetailsTitleSection from './ReportDetailsTitleSection';

type ReportDetailsContentProps = {
    reportID: string;
};

function ReportDetailsContent({reportID}: ReportDetailsContentProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
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
    const base62ReportID = getBase62ReportID(Number(reportID));

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
                <HeaderWithBackButtonAndTitle
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackFromReportDetailsPath)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        <ReportDetailsAvatar reportID={reportID} />
                    </View>
                    {isExpenseReport ? <ReportDetailsTitleSection reportID={reportID} /> : <ReportDetailsNameSection reportID={reportID} />}

                    <ReportDetailsDescription reportID={reportID} />

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
                                title={reportID}
                                description={translate('common.longReportID')}
                                copyValue={reportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                        </>
                    )}

                    <ReportDetailsPromotedActions reportID={reportID} />

                    <ReportDetailsActions reportID={reportID} />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default ReportDetailsContent;
