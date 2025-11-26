import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isExpenseReport, isIOUReport} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import {getReportLayoutGroupBy, setReportLayoutGroupBy} from '@userActions/ReportLayout';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReportLayoutGroupBy} from '@src/types/onyx';

type ReportLayoutPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.REPORT_LAYOUT>;

function ReportLayoutPage({report}: ReportLayoutPageProps) {
    const {translate} = useLocalize();
    const [reportLayoutGroupBy] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY, {canBeMissing: true});

    // Only show for expense reports that are not IOU reports (workspace expense reports)
    const shouldShowPage = isExpenseReport(report) && !isIOUReport(report);

    const currentGroupBy = getReportLayoutGroupBy(reportLayoutGroupBy);

    const groupByOptions = [
        {
            value: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            text: translate('reportLayout.groupBy.category'),
            keyForList: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            isSelected: currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
        },
        {
            value: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            text: translate('reportLayout.groupBy.tag'),
            keyForList: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            isSelected: currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG,
        },
    ];

    const updateGroupBy = useCallback(
        (value: ReportLayoutGroupBy) => {
            setReportLayoutGroupBy(value, reportLayoutGroupBy);
            Navigation.goBack();
        },
        [reportLayoutGroupBy],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ReportLayoutPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!shouldShowPage}>
                <HeaderWithBackButton
                    title={translate('reportLayout.reportLayout')}
                    onBackButtonPress={Navigation.goBack}
                />
                <SelectionList
                    data={groupByOptions}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(option) => updateGroupBy(option.value)}
                    shouldSingleExecuteRowSelect
                    shouldHighlightSelectedItem={false}
                    initiallyFocusedItemKey={groupByOptions.find((option) => option.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportLayoutPage.displayName = 'ReportLayoutPage';

export default withReportOrNotFound()(ReportLayoutPage);
