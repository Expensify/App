import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {updateWriteCapability as updateWriteCapabilityUtil} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {canEditWriteCapability} from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type DynamicWriteCapabilityPageProps = WithReportOrNotFoundProps;

function DynamicWriteCapabilityPage({report, policy}: DynamicWriteCapabilityPageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.path);
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

    const goBack = () => {
        Navigation.goBack(backPath);
    };

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

export default withReportOrNotFound()(DynamicWriteCapabilityPage);
