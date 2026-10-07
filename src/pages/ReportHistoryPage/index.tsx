import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportHistoryNavigatorParamList} from '@libs/Navigation/types';
import {isMoneyRequestReport} from '@libs/ReportUtils';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import getMockReportHistorySteps from './getMockReportHistorySteps';
import ReportHistoryItem from './ReportHistoryItem';

type ReportHistoryPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportHistoryNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_HISTORY>;

function ReportHistoryPage({report}: ReportHistoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_HISTORY.path);

    const steps = getMockReportHistorySteps(report);

    return (
        <ScreenWrapper testID="ReportHistoryPage">
            <FullPageNotFoundView shouldShow={!isMoneyRequestReport(report)}>
                <HeaderWithBackButtonAndTitle
                    title={translate('reportHistoryPage.title')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <ScrollView contentContainerStyle={[styles.ph5, styles.pv3]}>
                    {steps.map((step, index) => (
                        <View key={`${step.action}_${step.accountID}_${step.created ?? index}`}>
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
