import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {updateWriteCapability as updateWriteCapabilityUtil} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canEditWriteCapability} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WriteCapabilityPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY>;

function WriteCapabilityPage({report, policy}: WriteCapabilityPageProps) {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY>>();
    const {translate} = useLocalize();
    const writeCapabilityOptions = Object.values(CONST.REPORT.WRITE_CAPABILITIES).map((value) => ({
        value,
        text: translate(`writeCapabilityPage.writeCapability.${value}`),
        keyForList: value,
        isSelected: value === (report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL),
    }));
    const selectedOptionKey = writeCapabilityOptions.find((locale) => locale.isSelected)?.keyForList;
    const isReportArchived = useReportIsArchived(report.reportID);
    const isAbleToEdit = canEditWriteCapability(report, policy, isReportArchived);

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID, route.params.backTo));
    }, [report.reportID, route.params.backTo]);

    const updateWriteCapability = useCallback(
        (newValue: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>) => {
            updateWriteCapabilityUtil(report, newValue);
            goBack();
        },
        [report, goBack],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="WriteCapabilityPage"
        >
            <FullPageNotFoundView shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton
                    title={translate('writeCapabilityPage.label')}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={writeCapabilityOptions}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => updateWriteCapability(option.value)}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={selectedOptionKey}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(WriteCapabilityPage);
